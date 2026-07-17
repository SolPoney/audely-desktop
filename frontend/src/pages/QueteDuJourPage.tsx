import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import { ChevronLeft, CheckCircle2, ChevronRight, Lock, Zap } from "lucide-react";

interface ExerciceQuete {
	id: number;
	titre: string;
	niveau: string;
	type_exercice: string;
	nb_revisions: number;
}

/* Couleurs RGAA AA — 4.5:1 sur blanc et blanc sur couleur */
const NIVEAU_CONFIG: Record<string, { couleur: string; label: string }> = {
	facile:    { couleur: "#0f766e", label: "Facile" },   // teal-700  5.47:1
	moyen:     { couleur: "#b45309", label: "Moyen" },    // amber-700 5.02:1
	difficile: { couleur: "#DC2626", label: "Difficile" }, // red-600  4.83:1
};

const TYPE_LABEL: Record<string, string> = {
	detecter:           "Détection",
	reconnaitre:        "Reconnaître",
	reconnaitre_rythme: "Rythme",
	distinguer:         "Distinction",
	court_moyen_long:   "Durée",
	comprendre:         "Compréhension",
	memoriser:          "Mémoriser",
	grave_aigu:         "Grave / Aigu",
	themes:             "Thème",
	mot_similaire:      "Mots similaires",
	decision:           "Décision",
};


const QueteDuJourPage = () => {
	const navigate = useNavigate();
	const [exercices, setExercices] = useState<ExerciceQuete[]>([]);
	const [nbFaits, setNbFaits]     = useState(0);
	const [complete, setComplete]   = useState(false);
	const [loading, setLoading]     = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("token");
		fetch(`${API_URL}/api/quete-du-jour`, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(r => r.ok ? r.json() : null)
			.then(data => {
				if (!data) { setLoading(false); return; }
				setExercices(data.exercices ?? []);
				setNbFaits(data.nbFaits ?? 0);
				setComplete(data.complete ?? false);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	const pct = exercices.length > 0 ? Math.round((nbFaits / exercices.length) * 100) : 0;

	if (exercices.length === 0) {
		return (
			<div className="quete-page">
				<div className="quete-header">
					<button type="button" className="btn-back" onClick={() => navigate("/dashboard")}>← Retour</button>
				</div>
				<div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "var(--color-text-muted)" }}>
					<p style={{ fontSize: "2.5rem" }}>🎉</p>
					<p style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--color-text)", marginTop: "0.5rem" }}>
						Aucun exercice disponible
					</p>
					<p style={{ marginTop: "0.5rem" }}>Revenez demain pour votre prochaine quête !</p>
				</div>
			</div>
		);
	}

	return (
		<div className="pl-page">
			<a href="#quete-content" className="skip-link">Aller au contenu</a>

			{/* Hero éclair */}
			<div className="quete-hero">
				<button
					type="button"
					className="pl-back"
					onClick={() => navigate("/dashboard")}
					aria-label="Retour au tableau de bord"
				>
					<ChevronLeft size={20} strokeWidth={2.5} />
				</button>

				<div className="quete-hero-icon" aria-hidden="true">
					<Zap size={30} color="white" strokeWidth={2.2} fill="rgba(255,255,255,0.3)" />
				</div>
				<h1 className="quete-hero-title">Quête du jour</h1>
				<p className="quete-hero-sub">
					{loading
						? "Chargement…"
						: complete
						? "Félicitations, quête accomplie !"
						: exercices.length > 0
						? `${nbFaits} / ${exercices.length} exercices réalisés`
						: "Revenez demain !"}
				</p>

				{!loading && exercices.length > 0 && (
					<div className="quete-pbar-wrap">
						<div
							className="quete-pbar"
							role="progressbar"
							aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
							aria-label={`Progression : ${pct}%`}
						>
							<div className="quete-pbar-fill" style={{ width: `${pct}%` }} />
						</div>
						<span className="quete-pbar-pct">{pct}%</span>
					</div>
				)}
			</div>

			{/* Contenu */}
			<main id="quete-content" className="pl-scroll">
				{loading ? (
					<p className="loading-text" aria-live="polite">Chargement de votre quête…</p>
				) : exercices.length === 0 ? (
					<div className="quete-empty">
						<p className="quete-empty-icon">🌱</p>
						<p className="quete-empty-titre">Revenez demain !</p>
						<p className="quete-empty-sub">Votre prochaine quête vous attend.</p>
					</div>
				) : (
					<>
						<ol className="pl-timeline" aria-label="Exercices de la quête du jour">
							{exercices.map((exo, i) => {
								const estFait       = i < nbFaits;
								const estCourant    = i === nbFaits && !complete;
								const estVerrouille = !estFait && !estCourant;
								const cfg = NIVEAU_CONFIG[exo.niveau] ?? NIVEAU_CONFIG.facile;
								const couleur = estVerrouille ? "#CBD5E1" : cfg.couleur;

								return (
									<li key={exo.id} className="pl-item" style={{ animationDelay: `${i * 55}ms` }}>
										<div
											className="pl-item-left"
											aria-hidden="true"
											style={{ "--level-color": couleur } as React.CSSProperties}
										>
											<div className="pl-cercle-wrap">
												<div
													className="pl-cercle"
													style={{
														borderColor: couleur,
														background: estFait || estCourant ? couleur : "#F1F5F9",
													}}
												>
													{estFait
														? <CheckCircle2 size={18} strokeWidth={2.5} color="white" />
														: estCourant
														? <ChevronRight size={18} strokeWidth={2.5} color="white" />
														: <Lock size={16} strokeWidth={2} color="#64748B" />
													}
												</div>
												<span
													className="pl-num-badge"
													style={{ background: couleur }}
												>
													{String(i + 1).padStart(2, "0")}
												</span>
											</div>
											{i < exercices.length - 1 && (
												<div
													className="pl-ligne"
													style={{ background: estFait ? cfg.couleur : undefined }}
												/>
											)}
										</div>

										<button
											type="button"
											className={`pl-card${estVerrouille ? " pl-card--locked" : ""}${estFait ? " pl-card--done" : ""}`}
											onClick={() => estCourant && navigate(`/exercice/${exo.id}`)}
											disabled={estVerrouille || estFait}
											aria-label={`Exercice ${i + 1} : ${exo.titre}${estVerrouille ? " (verrouillé)" : ""}`}
										>
											<span className="pl-card-type" style={{ color: estVerrouille ? "#94A3B8" : cfg.couleur }}>
												{TYPE_LABEL[exo.type_exercice] ?? "Exercice"}
												{exo.nb_revisions > 0 && " · Révision"}
											</span>
											<span className="pl-card-titre">{exo.titre}</span>
											{estFait && (
												<span className="plp-done-badge">
													<CheckCircle2 size={13} strokeWidth={2.5} />
													Complété
												</span>
											)}
											{estCourant && (
												<span className="plp-unlock-badge" style={{ "--plp-unlock-color": cfg.couleur } as React.CSSProperties}>
													<ChevronRight size={12} strokeWidth={2.5} />
													{cfg.label}
												</span>
											)}
											{estVerrouille && (
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

						{/* Bannière succès */}
						{complete && (
							<div className="quete-success">
								<p className="quete-success-emoji">🏆</p>
								<p className="quete-success-titre">Quête du jour accomplie !</p>
								<p className="quete-success-sub">Revenez demain pour de nouveaux exercices.</p>
								<button type="button" className="quete-success-btn" onClick={() => navigate("/dashboard")}>
									Retour au tableau de bord
								</button>
							</div>
						)}
					</>
				)}
			</main>
		</div>
	);
};

export default QueteDuJourPage;
