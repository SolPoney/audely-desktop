import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Timer, Music2, Shuffle, Ruler, Headphones, BookOpen, Lock, CheckCircle2, Brain, ChevronRight, Unlock } from "lucide-react";
import { API_URL } from "../config/api";

const CAT_GRADIENT = "linear-gradient(160deg, #1E1035 0%, #3B1D70 40%, #7C3AED 100%)";
const CAT_COLOR    = "#7C3AED";

const NIVEAUX: string[] = ["facile", "moyen", "difficile"];
const NIVEAU_LABEL: Record<string, string> = { facile: "Facile", moyen: "Moyen", difficile: "Difficile" };

const TYPE_ICON: Record<string, React.ReactNode> = {
	detecter:                <Timer      size={18} strokeWidth={1.6} color="white" />,
	reconnaitre:             <Headphones size={18} strokeWidth={1.6} color="white" />,
	reconnaitre_rythme:      <Music2     size={18} strokeWidth={1.6} color="white" />,
	distinguer:              <Shuffle    size={18} strokeWidth={1.6} color="white" />,
	court_moyen_long:        <Ruler      size={18} strokeWidth={1.6} color="white" />,
	comprendre:              <BookOpen   size={18} strokeWidth={1.6} color="white" />,
	memoriser:               <Brain      size={18} strokeWidth={1.6} color="white" />,
	themes:                  <BookOpen   size={18} strokeWidth={1.6} color="white" />,
	grave_aigu:              <Music2     size={18} strokeWidth={1.6} color="white" />,
};

const TYPE_LABEL: Record<string, string> = {
	detecter:                "Détection",
	reconnaitre:             "Reconnaître",
	reconnaitre_rythme:      "Rythme",
	distinguer:              "Distinction",
	court_moyen_long:        "Durée",
	comprendre:              "Compréhension",
	memoriser:               "Mémoriser",
	themes:                  "Thème",
	grave_aigu:              "Grave / Aigu",
};

const ExercicesCatPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [exercices, setExercices]   = useState<any[]>([]);
	const [categorie, setCategorie]   = useState<string>("");
	const [completes, setCompletes]   = useState<Set<number>>(new Set());
	const [loading, setLoading]       = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("token");
		Promise.all([
			fetch(`${API_URL}/api/categories/${id}/exercices`).then(r => r.json()),
			fetch(`${API_URL}/api/categories`).then(r => r.json()),
			fetch(`${API_URL}/api/stats/completes`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
		]).then(([exos, cats, done]) => {
			setExercices(exos);
			const cat = cats.find((c: any) => String(c.id) === String(id));
			if (cat) setCategorie(cat.titre);
			setCompletes(new Set(done as number[]));
			setLoading(false);
		}).catch(() => setLoading(false));
	}, [id]);

	/* ── Logique de progression ── */
	const isUnlocked = (ex: any, index: number, grouped: Record<string, any[]>) => {
		const niveau = ex.niveau as string;
		const niveauIdx = NIVEAUX.indexOf(niveau);

		// Niveau facile : premier exo toujours disponible,
		// les suivants s'ouvrent dès que le précédent est complété
		const exosDuNiveau = grouped[niveau] ?? [];
		const posInNiveau  = exosDuNiveau.findIndex((e: any) => e.id === ex.id);

		// Vérifier que tous les niveaux précédents sont terminés
		for (let n = 0; n < niveauIdx; n++) {
			const exosPrecedents = grouped[NIVEAUX[n]] ?? [];
			if (exosPrecedents.some((e: any) => !completes.has(e.id))) return false;
		}

		// Premier exo du niveau → toujours ouvert (si niveaux précédents OK)
		if (posInNiveau === 0) return true;
		// Exos suivants → le précédent doit être complété
		return completes.has(exosDuNiveau[posInNiveau - 1].id);
	};

	/* Regrouper par niveau dans l'ordre */
	const grouped: Record<string, any[]> = { facile: [], moyen: [], difficile: [] };
	exercices.forEach(ex => {
		if (grouped[ex.niveau]) grouped[ex.niveau].push(ex);
	});

	return (
		<div className="pl-page">
			<a href="#cat-content" className="skip-link">Aller au contenu</a>

			<header className="pl-header" style={{ background: CAT_GRADIENT }}>
				<button
					type="button"
					className="pl-back"
					onClick={() => navigate("/exercices")}
					aria-label="Retour aux catégories"
				>
					<ChevronLeft size={20} strokeWidth={2.5} />
				</button>

				<div className="pl-header-body">
					<h1 className="pl-header-titre">{categorie || "Catégorie"}</h1>
					{!loading && (
						<p className="pl-header-count">
							{completes.size > 0
								? `${[...completes].filter(id => exercices.some(e => e.id === id)).length} / ${exercices.length} terminé${exercices.length > 1 ? "s" : ""}`
								: `${exercices.length} exercice${exercices.length > 1 ? "s" : ""}`}
						</p>
					)}
				</div>

				<div className="pl-header-wave" aria-hidden="true">
					<svg viewBox="0 0 375 40" preserveAspectRatio="none">
						<path d="M0,20 C80,40 295,0 375,20 L375,40 L0,40 Z" fill="var(--color-bg)" />
					</svg>
				</div>
			</header>

			<main id="cat-content" className="pl-scroll">
				{loading ? (
					<p className="loading-text" aria-live="polite">Chargement…</p>
				) : exercices.length === 0 ? (
					<p className="loading-text">Aucun exercice dans cette catégorie.</p>
				) : (
					<div className="plp-niveaux">
						{NIVEAUX.map(niveau => {
							const exos = grouped[niveau];
							if (!exos || exos.length === 0) return null;
							const niveauIdx = NIVEAUX.indexOf(niveau);
							const precedentsOk = NIVEAUX.slice(0, niveauIdx).every(n =>
								(grouped[n] ?? []).every((e: any) => completes.has(e.id))
							);
							return (
								<section key={niveau} className="plp-niveau-section">
									<div className="plp-niveau-header">
										<span className={`plp-niveau-badge plp-niveau-badge--${niveau}`}>
											{NIVEAU_LABEL[niveau]}
										</span>
										{!precedentsOk && niveauIdx > 0 && (
											<span className="plp-niveau-lock-hint">
												<Lock size={12} strokeWidth={2.5} />
												Terminez le niveau précédent
											</span>
										)}
									</div>

									<ol className="pl-timeline">
										{exos.map((ex: any, i: number) => {
											const done     = completes.has(ex.id);
											const unlocked = isUnlocked(ex, i, grouped);
											return (
												<li
													key={ex.id}
													className="pl-item"
													style={{ animationDelay: `${i * 55}ms` }}
												>
													<div
														className="pl-item-left"
														aria-hidden="true"
														style={{ "--level-color": unlocked ? CAT_COLOR : "#CBD5E1" } as React.CSSProperties}
													>
														<div className="pl-cercle-wrap">
															<div className="pl-cercle" style={{ borderColor: unlocked ? CAT_COLOR : "#CBD5E1", background: done ? CAT_COLOR : unlocked ? CAT_COLOR : "#F1F5F9" }}>
																{done
																	? <CheckCircle2 size={18} strokeWidth={2.5} color="white" />
																	: unlocked
																		? <ChevronRight size={18} strokeWidth={2.5} color="white" />
																		: <Lock size={16} strokeWidth={2} color="#94A3B8" />
																}
															</div>
															<span className="pl-num-badge" style={{ background: unlocked ? CAT_COLOR : "#CBD5E1" }}>
																{String(i + 1).padStart(2, "0")}
															</span>
														</div>
														{i < exos.length - 1 && <div className="pl-ligne" style={{ background: completes.has(ex.id) ? CAT_COLOR : undefined }} />}
													</div>

													<button
														type="button"
														className={`pl-card${!unlocked ? " pl-card--locked" : ""}${done ? " pl-card--done" : ""}`}
														onClick={() => unlocked && navigate(`/exercice/${ex.id}`)}
														disabled={!unlocked}
														aria-label={`Exercice ${i + 1} : ${ex.titre}${!unlocked ? " (verrouillé)" : ""}`}
													>
														<span className="pl-card-type" style={{ color: unlocked ? CAT_COLOR : "#94A3B8" }}>
															{TYPE_LABEL[ex.type_exercice] ?? "Exercice"}
														</span>
														<span className="pl-card-titre">{ex.titre}</span>
														{done && (
															<span className="plp-done-badge">
																<CheckCircle2 size={13} strokeWidth={2.5} />
																Complété
															</span>
														)}
														{unlocked && !done && (
															<span className="plp-unlock-badge" style={{ "--plp-unlock-color": CAT_COLOR } as React.CSSProperties}>
																<Unlock size={12} strokeWidth={2.5} />
																Débloqué
															</span>
														)}
														{!unlocked && !done && (
															<span className="plp-lock-badge">
																<Lock size={12} strokeWidth={2.5} />
																Verrouillé
															</span>
														)}
													</button>
												</li>
											);
										})}
									</ol>
								</section>
							);
						})}
					</div>
				)}
			</main>
		</div>
	);
};

export default ExercicesCatPage;
