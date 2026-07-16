import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Timer, Music2, Shuffle, Ruler, Headphones, BookOpen, Lock, CheckCircle2, Brain, ChevronRight, Unlock } from "lucide-react";
import { API_URL } from "../config/api";

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

const NIVEAU_CONFIG: Record<string, { label: string; couleur: string; gradient: string }> = {
	facile:    { label: "Niveau facile",    couleur: "#0D9488", gradient: "linear-gradient(160deg, #042F2E 0%, #065F4A 40%, #0D9488 100%)" },
	moyen:     { label: "Niveau moyen",     couleur: "#D97706", gradient: "linear-gradient(160deg, #451A03 0%, #92400E 40%, #D97706 100%)" },
	difficile: { label: "Niveau difficile", couleur: "#DC2626", gradient: "linear-gradient(160deg, #450A0A 0%, #991B1B 40%, #DC2626 100%)" },
};

const NIVEAU_BARRES: Record<string, number> = { facile: 1, moyen: 2, difficile: 3 };

const NiveauIcon = ({ barres }: { barres: number }) => (
	<div style={{ display: "flex", alignItems: "flex-end", gap: 5, marginBottom: "1rem" }} aria-hidden="true">
		{[1, 2, 3].map((b) => (
			<div key={b} style={{
				width: 8, height: b * 10 + 4,
				background: "white",
				borderRadius: 4,
				opacity: b <= barres ? 1 : 0.25,
			}} />
		))}
	</div>
);

const ParcoursListePage = () => {
	const { niveau } = useParams<{ niveau: string }>();
	const navigate   = useNavigate();
	const [exercices, setExercices]   = useState<any[]>([]);
	const [completes, setCompletes]   = useState<Set<number>>(new Set());
	const [chargement, setChargement] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("token");
		Promise.all([
			fetch(`${API_URL}/api/exercices`).then(r => r.json()),
			fetch(`${API_URL}/api/stats/completes`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
		]).then(([data, done]) => {
			setExercices(data.filter((ex: any) => ex.niveau === niveau));
			setCompletes(new Set(done as number[]));
			setChargement(false);
		});
	}, [niveau]);

	const config = NIVEAU_CONFIG[niveau ?? ""] ?? NIVEAU_CONFIG.facile;
	const barres = NIVEAU_BARRES[niveau ?? ""] ?? 1;

	/* Un exo est accessible s'il est déjà complété, ou si le précédent est complété */
	const isUnlocked = (index: number) => {
		if (completes.has(exercices[index].id)) return true;
		if (index === 0) return true;
		return completes.has(exercices[index - 1].id);
	};

	const nbCompletes = exercices.filter(ex => completes.has(ex.id)).length;

	return (
		<div className="pl-page">
			<a href="#pl-content" className="skip-link">Aller au contenu</a>

			<header className="pl-header" style={{ background: config.gradient }}>
				<button
					type="button"
					className="pl-back"
					onClick={() => navigate("/parcours")}
					aria-label="Retour aux parcours"
				>
					<ChevronLeft size={20} strokeWidth={2.5} />
				</button>

				<div className="pl-header-body">
					<NiveauIcon barres={barres} />
					<h1 className="pl-header-titre">{config.label}</h1>
					{!chargement && (
						<p className="pl-header-count">
							{nbCompletes > 0
								? `${nbCompletes} / ${exercices.length} terminé${exercices.length > 1 ? "s" : ""}`
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

			<main id="pl-content" className="pl-scroll">
				{chargement ? (
					<p className="loading-text" aria-live="polite">Chargement…</p>
				) : exercices.length === 0 ? (
					<p className="loading-text">Aucun exercice pour ce niveau.</p>
				) : (
					<ol className="pl-timeline" aria-label={`Exercices ${config.label}`}>
						{exercices.map((ex, index) => {
							const done     = completes.has(ex.id);
							const unlocked = isUnlocked(index);
							return (
								<li
									key={ex.id}
									className="pl-item"
									style={{ animationDelay: `${index * 55}ms` }}
								>
									<div
										className="pl-item-left"
										aria-hidden="true"
										style={{ "--level-color": unlocked ? config.couleur : "#CBD5E1" } as React.CSSProperties}
									>
										<div className="pl-cercle-wrap">
											<div
												className="pl-cercle"
												style={{
													borderColor: unlocked ? config.couleur : "#CBD5E1",
													background:  done ? config.couleur : unlocked ? config.couleur : "#F1F5F9",
												}}
											>
												{done
													? <CheckCircle2 size={18} strokeWidth={2.5} color="white" />
													: unlocked
														? <ChevronRight size={18} strokeWidth={2.5} color="white" />
														: <Lock size={16} strokeWidth={2} color="#94A3B8" />
												}
											</div>
											<span
												className="pl-num-badge"
												style={{ background: unlocked ? config.couleur : "#CBD5E1" }}
											>
												{String(index + 1).padStart(2, "0")}
											</span>
										</div>
										{index < exercices.length - 1 && (
											<div
												className="pl-ligne"
												style={{ background: done ? config.couleur : undefined }}
											/>
										)}
									</div>

									<button
										type="button"
										className={`pl-card${!unlocked ? " pl-card--locked" : ""}${done ? " pl-card--done" : ""}`}
										onClick={() => unlocked && navigate(`/exercice/${ex.id}`)}
										disabled={!unlocked}
										aria-label={`Exercice ${index + 1} : ${ex.titre}${!unlocked ? " (verrouillé)" : ""}`}
									>
										<span className="pl-card-type" style={{ color: unlocked ? config.couleur : "#94A3B8" }}>
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
											<span className="plp-unlock-badge" style={{ "--plp-unlock-color": config.couleur } as React.CSSProperties}>
												<Unlock size={12} strokeWidth={2.5} />
												Débloqué
											</span>
										)}
										{!unlocked && (
											<span className="plp-lock-badge">
												<Lock size={12} strokeWidth={2.5} />
												Terminez l'exercice précédent
											</span>
										)}
									</button>
								</li>
							);
						})}
					</ol>
				)}
			</main>
		</div>
	);
};

export default ParcoursListePage;
