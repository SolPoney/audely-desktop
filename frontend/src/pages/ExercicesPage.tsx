import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import { ChevronLeft, Ear, Headphones, Music, MessageCircle, Brain, BookOpen, HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CAT_META: Record<string, { icon: LucideIcon; desc: string }> = {
	"Détecter":                  { icon: Ear,           desc: "Repérer les sons" },
	"Reconnaître":               { icon: Headphones,    desc: "Retrouver des sons et des mots" },
	"Distinguer":                { icon: Music,         desc: "Faire la différence entre les sons" },
	"Comprendre":                { icon: MessageCircle, desc: "Interpréter des phrases" },
	"Mémoriser":                 { icon: Brain,         desc: "Retenir des informations" },
	"Thèmes":                    { icon: BookOpen,      desc: "Exercices classés par sujet" },
	"Court / Long":              { icon: Music,         desc: "Identifier la durée d'un son" },
	"Discrimination auditive":   { icon: Ear,           desc: "Distinguer des mots très proches" },
};

const ExercicesPage = () => {
	const navigate = useNavigate();
	const [categories, setCategories] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch(`${API_URL}/api/categories`)
			.then((res) => res.json())
			.then((data) => { setCategories(data); setLoading(false); })
			.catch(() => setLoading(false));
	}, []);

	return (
		<div className="excat-page">
			<a href="#excat-content" className="skip-link">Aller au contenu</a>

			<button
				type="button"
				className="parcours-back-btn"
				onClick={() => navigate("/dashboard")}
				aria-label="Retour au tableau de bord"
			>
				<ChevronLeft size={22} strokeWidth={2.5} />
			</button>

			<main id="excat-content" className="excat-main">
				<div className="excat-hero">
					<div className="excat-hero-icon" aria-hidden="true">
						<Headphones size={36} strokeWidth={1.6} />
					</div>
					<h1 className="excat-title">Catégorie</h1>
					<p className="excat-subtitle">
						Tous les exercices accessibles par thème ou compétence entraînée
					</p>
				</div>

				{loading ? (
					<p className="loading-text" aria-live="polite">Chargement…</p>
				) : (
					<ul className="excat-grid" aria-label="Choisissez une catégorie">
						{categories.map((cat) => {
							const meta = CAT_META[cat.titre] ?? { icon: HelpCircle, desc: "" };
							const Icon = meta.icon;
							return (
								<li key={cat.id}>
									<button
										type="button"
										className="excat-card"
										onClick={() => navigate(`/exercices/categorie/${cat.id}`)}
										aria-label={`${cat.titre} — ${meta.desc}`}
									>
										<div className="excat-card-icon" aria-hidden="true">
											<Icon size={28} strokeWidth={1.6} />
										</div>
										<p className="excat-card-title">{cat.titre}</p>
										<p className="excat-card-desc">{meta.desc}</p>
									</button>
								</li>
							);
						})}
					</ul>
				)}
			</main>
		</div>
	);
};

export default ExercicesPage;
