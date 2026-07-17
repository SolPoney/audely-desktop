import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import { ChevronLeft, CheckCircle2, ChevronRight, Lock } from "lucide-react";

interface ExerciceQuete {
	id: number;
	titre: string;
	niveau: string;
	type_exercice: string;
	nb_revisions: number;
}

const NIVEAU_CONFIG: Record<string, { couleur: string; label: string }> = {
	facile:    { couleur: "#0D9488", label: "Facile" },
	moyen:     { couleur: "#D97706", label: "Moyen" },
	difficile: { couleur: "#DC2626", label: "Difficile" },
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

const HERO_GRADIENT = "linear-gradient(160deg, #042F2E 0%, #065F4A 40%, #16a34a 100%)";
const HERO_COULEUR  = "#16a34a";

const NiveauIcon = () => (
	<div style={{ display: "flex", alignItems: "flex-end", gap: 5, marginBottom: "1rem" }} aria-hidden="true">
		<div style={{ width: 8, height: 14, background: "white", borderRadius: 4 }} />
		<div style={{ width: 8, height: 24, background: "white", borderRadius: 4, opacity: 0.55 }} />
		<div style={{ width: 8, height: 34, background: "white", borderRadius: 4, opacity: 0.3 }} />
	</div>
);

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

	return (
		<div className="pl-page">
			<a href="#quete-content" className="skip-link">Aller au contenu</a>

			{/* Header */}
			<header className="pl-header" style={{ background: HERO_GRADIENT }}>
				<button
					type="button"
					className="pl-back"
					onClick={() => navigate("/dashboard")}
					aria-label="Retour au tableau de bord"
				>
					<ChevronLeft size={20} strokeWidth={2.5} />
				</button>

				<div className="pl-header-body">
					<NiveauIcon />
					<h1 className="pl-header-titre">Quête du jour</h1>
					<p className="pl-header-count">
						{loading
							? "Chargement…"
							: complete
							? "Quête accomplie !"
							: exercices.length > 0
							? `${nbFaits} / ${exercices.length} terminés`
							: "Revenez demain !"}
					</p>
				</div>

				{/* Barre de progression dans le header */}
				{!loading && exercices.length > 0 && (
					<div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
						<div style={{
							flex: 1, height: 8, background: "rgba(255,255,255,0.22)",
							borderRadius: 99, overflow: "hidden",
						}}
							role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
							aria-label={`Progression : ${pct}%`}
						>
							<div style={{
								height: "100%", width: `${pct}%`, background: "white",
								borderRadius: 99, transition: "width 0.6s ease",
							}} />
						</div>
						<span style={{ fontSize: "0.8125rem", fontWeight: 800, color: "white", minWidth: 32 }}>
							{pct}%
						</span>
					</div>
				)}

				<div className="pl-header-wave" aria-hidden="true">
					<svg viewBox="0 0 375 40" preserveAspectRatio="none">
						<path d="M0,20 C80,40 295,0 375,20 L375,40 L0,40 Z" fill="var(--color-bg)" />
					</svg>
				</div>
			</header>

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
														: <Lock size={16} strokeWidth={2} color="#94A3B8" />
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
