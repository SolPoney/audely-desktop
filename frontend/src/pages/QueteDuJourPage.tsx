import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import { Zap, CheckCircle2, Lock, ChevronLeft } from "lucide-react";

interface ExerciceQuete {
	id: number;
	titre: string;
	niveau: string;
	type_exercice: string;
	nb_revisions: number;
}

const NIVEAU_CONFIG: Record<string, { couleur: string; label: string; barres: number }> = {
	facile:    { couleur: "#0D9488", label: "Facile",    barres: 1 },
	moyen:     { couleur: "#D97706", label: "Moyen",     barres: 2 },
	difficile: { couleur: "#DC2626", label: "Difficile", barres: 3 },
};

const NiveauBarres = ({ barres, couleur }: { barres: number; couleur: string }) => (
	<div className="quete-card-barres" aria-hidden="true">
		{[1, 2, 3].map(b => (
			<div
				key={b}
				className="quete-card-barre"
				style={{ height: `${b * 7 + 4}px`, background: couleur, opacity: b <= barres ? 1 : 0.15 }}
			/>
		))}
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

	if (loading) {
		return (
			<div className="quete-page">
				<p className="loading-text" aria-live="polite">Chargement de votre quête…</p>
			</div>
		);
	}

	if (exercices.length === 0) {
		return (
			<div className="quete-page">
				<button type="button" className="parcours-back-btn" onClick={() => navigate("/dashboard")} aria-label="Retour">
					<ChevronLeft size={22} strokeWidth={2.5} />
				</button>
				<div className="quete-empty">
					<p className="quete-empty-icon">🌱</p>
					<p className="quete-empty-titre">Revenez demain !</p>
					<p className="quete-empty-sub">Votre prochaine quête vous attend.</p>
				</div>
			</div>
		);
	}

	const pct = Math.round((nbFaits / exercices.length) * 100);

	return (
		<div className="quete-page">

			{/* Bouton retour */}
			<button type="button" className="parcours-back-btn" onClick={() => navigate("/dashboard")} aria-label="Retour">
				<ChevronLeft size={22} strokeWidth={2.5} />
			</button>

			{/* Hero */}
			<div className="quete-hero">
				<div className="quete-hero-icon" aria-hidden="true">
					<Zap size={30} color="white" strokeWidth={2.2} fill="rgba(255,255,255,0.3)" />
				</div>
				<h1 className="quete-hero-title">Quête du jour</h1>
				<p className="quete-hero-sub">
					{complete ? "Félicitations, quête accomplie !" : `${nbFaits} / ${exercices.length} exercices réalisés`}
				</p>

				<div className="quete-pbar-wrap">
					<div
						className="quete-pbar"
						role="progressbar"
						aria-valuenow={pct}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label={`Progression : ${pct}%`}
					>
						<div className="quete-pbar-fill" style={{ width: `${pct}%` }} />
					</div>
					<span className="quete-pbar-pct">{pct}%</span>
				</div>
			</div>

			{/* Grille de cartes */}
			<main className="quete-main">
				<ul className="quete-grid" aria-label="Exercices de la quête">
					{exercices.map((exo, i) => {
						const estFait       = i < nbFaits;
						const estCourant    = i === nbFaits && !complete;
						const estVerrouille = i > nbFaits && !complete;
						const cfg = NIVEAU_CONFIG[exo.niveau] ?? NIVEAU_CONFIG.facile;

						return (
							<li key={exo.id}>
								<button
									type="button"
									className={[
										"quete-card",
										estFait       ? "quete-card--fait"    : "",
										estCourant    ? "quete-card--courant" : "",
										estVerrouille ? "quete-card--locked"  : "",
									].join(" ").trim()}
									style={{ "--niveau-color": cfg.couleur } as React.CSSProperties}
									onClick={() => estCourant && navigate(`/exercice/${exo.id}`)}
									disabled={estVerrouille || estFait}
									aria-label={`${exo.titre} — ${cfg.label}${estFait ? " (terminé)" : estVerrouille ? " (verrouillé)" : ""}`}
								>
									{/* Badge état (top-left) */}
									<div className={[
										"quete-card-badge",
										estFait    ? "quete-card-badge--fait"    : "",
										estCourant ? "quete-card-badge--courant" : "",
									].join(" ").trim()}>
										{estFait
											? <CheckCircle2 size={16} color="white" strokeWidth={2.5} />
											: estVerrouille
											? <Lock size={13} color="#94a3b8" strokeWidth={2} />
											: <span>{i + 1}</span>
										}
									</div>

									{/* Barres de difficulté */}
									<NiveauBarres barres={cfg.barres} couleur={estCourant ? "white" : cfg.couleur} />

									{/* Titre */}
									<p className="quete-card-title" style={{ color: estCourant ? "white" : cfg.couleur }}>
										{exo.titre}
									</p>

									{/* Méta */}
									<p className="quete-card-desc">
										{cfg.label}
										{exo.nb_revisions > 0 && " · Révision"}
									</p>
								</button>
							</li>
						);
					})}
				</ul>

				{/* Bannière succès */}
				{complete && (
					<div className="quete-success">
						<p className="quete-success-emoji">🏆</p>
						<p className="quete-success-titre">Quête accomplie !</p>
						<p className="quete-success-sub">Revenez demain pour de nouveaux exercices.</p>
						<button type="button" className="quete-success-btn" onClick={() => navigate("/dashboard")}>
							Retour au tableau de bord
						</button>
					</div>
				)}
			</main>
		</div>
	);
};

export default QueteDuJourPage;
