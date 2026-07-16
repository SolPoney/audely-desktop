import { useNavigate } from "react-router-dom";
import { ChevronLeft, Music } from "lucide-react";

const NIVEAUX = [
	{
		niveau:      "facile",
		label:       "Niveau facile",
		description: "Commençons en douceur",
		barres:      1,
		couleur:     "#0D9488",
	},
	{
		niveau:      "moyen",
		label:       "Niveau moyen",
		description: "Continuons sur cette lancée",
		barres:      2,
		couleur:     "#D97706",
	},
	{
		niveau:      "difficile",
		label:       "Niveau difficile",
		description: "Finissons en beauté",
		barres:      3,
		couleur:     "#DC2626",
	},
];

const NiveauIcon = ({ barres, couleur }: { barres: number; couleur: string }) => (
	<div className="parcours-niveau-icon" aria-hidden="true">
		{[1, 2, 3].map((b) => (
			<div
				key={b}
				className="parcours-niveau-barre"
				style={{
					height: `${b * 8 + 4}px`,
					background: couleur,
					opacity: b <= barres ? 1 : 0.18,
				}}
			/>
		))}
	</div>
);

const ParcoursPage = () => {
	const navigate = useNavigate();

	return (
		<div className="parcours-page">
			<a href="#parcours-content" className="skip-link">Aller au contenu</a>

			<button
				type="button"
				className="parcours-back-btn"
				onClick={() => navigate("/dashboard")}
				aria-label="Retour au tableau de bord"
			>
				<ChevronLeft size={22} strokeWidth={2.5} />
			</button>

			<main id="parcours-content" className="parcours-main">
				<div className="parcours-hero">
					<div className="parcours-hero-icon">
						<Music size={32} color="white" strokeWidth={1.6} />
					</div>
					<h1 className="parcours-title">Parcours d'entraînement</h1>
					<p className="parcours-subtitle">
						Découvrez ici des parcours pour vous entraîner
					</p>
				</div>

				<ul className="parcours-grid" aria-label="Choisissez un niveau">
					{NIVEAUX.map(({ niveau, label, description, barres, couleur }) => (
						<li key={niveau}>
							<button
								type="button"
								className="parcours-card"
								style={{ "--niveau-color": couleur } as React.CSSProperties}
								onClick={() => navigate(`/parcours/${encodeURIComponent(niveau)}`)}
								aria-label={`${label} — ${description}`}
							>
								<NiveauIcon barres={barres} couleur={couleur} />
								<p className="parcours-card-title" style={{ color: couleur }}>{label}</p>
								<p className="parcours-card-desc">{description}</p>
							</button>
						</li>
					))}
				</ul>
			</main>
		</div>
	);
};

export default ParcoursPage;
