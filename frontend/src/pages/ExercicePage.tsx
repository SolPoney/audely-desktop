import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_URL } from "../config/api";
import { getUserId } from "../hooks/useAuth";
import { toast } from "sonner";
import { useTheme } from "../hooks/useTheme";
import DetecterExercice from "../components/DetecterExercice";
import ReconnaitreRythmeExercice from "../components/ReconnaitreRythmeExercice";
import DistinguerExercice from "../components/DistinguerExercice";
import CourtMoyenLongExercice from "../components/CourtMoyenLongExercice";
import ExercicePartenaire from "../components/ExercicePartenaire";
import DecisionOrthographiqueExercice from "../components/DecisionOrthographiqueExercice";
import GraveAiguExercice from "../components/GraveAiguExercice";

/* Hauteurs des barres de la waveform décorative */
const WAVEFORM_HEIGHTS = [20, 35, 50, 30, 60, 45, 70, 40, 55, 30, 65, 50, 35, 60, 25, 45, 70, 40, 30, 55];

const NIVEAUX = ["facile", "moyen", "difficile"];

const ExercicePage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { theme, toggleTheme } = useTheme();
	const [exercice, setExercice]   = useState<any>(null);
	const [acces, setAcces]         = useState<"chargement" | "ok" | "bloque">("chargement");

	useEffect(() => {
		const token = localStorage.getItem("token");
		Promise.all([
			fetch(`${API_URL}/api/exercices/${id}`).then(r => r.json()),
			fetch(`${API_URL}/api/stats/completes`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => []),
		]).then(([exo, done]) => {
			setExercice(exo);
			if (!exo?.id || !exo?.categorie_id) { setAcces("ok"); return; }

			const completesSet = new Set<number>(done as number[]);

			// Récupérer tous les exercices de la même catégorie pour calculer la position
			fetch(`${API_URL}/api/categories/${exo.categorie_id}/exercices`)
				.then(r => r.json())
				.then((tous: any[]) => {
					const grouped: Record<string, any[]> = { facile: [], moyen: [], difficile: [] };
					tous.forEach(e => { if (grouped[e.niveau]) grouped[e.niveau].push(e); });

					const niveauIdx   = NIVEAUX.indexOf(exo.niveau);
					const exosDuNiveau = grouped[exo.niveau] ?? [];
					const posInNiveau  = exosDuNiveau.findIndex((e: any) => e.id === exo.id);

					// Si déjà complété → toujours accessible
					if (completesSet.has(exo.id)) { setAcces("ok"); return; }

					// Tous les niveaux précédents doivent être complétés
					for (let n = 0; n < niveauIdx; n++) {
						if ((grouped[NIVEAUX[n]] ?? []).some((e: any) => !completesSet.has(e.id))) {
							setAcces("bloque"); return;
						}
					}
					// Pour le niveau actuel, l'exercice précédent doit être complété
					if (posInNiveau > 0 && !completesSet.has(exosDuNiveau[posInNiveau - 1].id)) {
						setAcces("bloque"); return;
					}
					setAcces("ok");
				})
				.catch(() => setAcces("ok")); // En cas d'erreur réseau, on laisse passer
		});
	}, [id]);

	if (acces === "chargement" || !exercice) {
		return (
			<div className="exercice-page">
				<p className="loading-text" aria-live="polite">Chargement de l'exercice…</p>
			</div>
		);
	}

	if (acces === "bloque") {
		return (
			<div className="exercice-page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "2rem", textAlign: "center" }}>
				<p style={{ fontSize: "2.5rem" }}>🔒</p>
				<p style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--color-text)" }}>Exercice verrouillé</p>
				<p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
					Terminez les exercices précédents pour débloquer celui-ci.
				</p>
				<button
					type="button"
					className="rythme-btn-noir"
					style={{ maxWidth: 280, marginTop: "0.5rem" }}
					onClick={() => navigate(-1)}
				>
					Retour
				</button>
			</div>
		);
	}

	if (exercice.type_exercice === "detecter") {
		return <DetecterExercice exercice={exercice} />;
	}

	if (exercice.type_exercice === "reconnaitre_rythme") {
		return <ReconnaitreRythmeExercice exercice={exercice} />;
	}

	if (exercice.type_exercice === "distinguer") {
		return <DistinguerExercice exercice={exercice} />;
	}

	if (exercice.type_exercice === "grave_aigu") {
		return <GraveAiguExercice exercice={exercice} />;
	}

	if (exercice.type_exercice === "court_moyen_long") {
		return <CourtMoyenLongExercice exercice={exercice} />;
	}

	if (exercice.type_exercice === "decision_orthographique") {
		return <DecisionOrthographiqueExercice exercice={exercice} />;
	}

	/* — Exercices avec contenu JSON (partenaire) */
	if (exercice.contenu) {
		return <ExercicePartenaire exercice={exercice} />;
	}

	/* — Interface standard pour les autres types */
	const handleSubmit = async (score: number) => {
		const token = localStorage.getItem("token");
		await fetch(`${API_URL}/api/resultats`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				id_utilisateur: getUserId(),
				id_exercice: Number(id),
				score,
			}),
		});
		toast.success("Exercice terminé !", {
			description: "Votre résultat a bien été enregistré.",
		});
	};

	return (
		<div className="exercice-page">
			<a href="#exercice-content" className="skip-link">
				Aller au contenu
			</a>

			<header className="app-header">
				<button
					type="button"
					className="btn-back"
					onClick={() => navigate("/dashboard")}
					aria-label="Retour au tableau de bord"
				>
					← Retour
				</button>
				<div className="header-actions">
					<button
						type="button"
						className="btn-icon"
						onClick={toggleTheme}
						aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
					>
						{theme === "dark" ? "☀️" : "🌙"}
					</button>
				</div>
			</header>

			<main id="exercice-content" className="exercice-main">
				<article>
					<header className="exercice-header">
						<span className="badge">{exercice.niveau}</span>
						<h1 className="exercice-title">{exercice.titre}</h1>
						<p className="exercice-description">{exercice.description}</p>
					</header>

					<div className="audio-card">
						<div className="audio-card-header">
							<div className="audio-card-icon" aria-hidden="true">🔊</div>
							<div>
								<p className="audio-card-label">Extrait audio</p>
								<p className="audio-card-sublabel">Écoutez attentivement</p>
							</div>
						</div>

						<div className="audio-waveform" aria-hidden="true">
							{WAVEFORM_HEIGHTS.map((h, i) => (
								<div
									key={i}
									className="audio-waveform-bar"
									style={{ height: `${h}%` }}
								/>
							))}
						</div>

						<audio
							controls
							src={exercice.audio_url}
							className="exercice-audio"
							aria-label={`Extrait audio de l'exercice : ${exercice.titre}`}
						>
							Votre navigateur ne supporte pas la lecture audio.
						</audio>
					</div>

					<button
						type="button"
						className="btn-finish"
						onClick={() => handleSubmit(100)}
					>
						Valider l'exercice ✓
					</button>
				</article>
			</main>
		</div>
	);
};

export default ExercicePage;
