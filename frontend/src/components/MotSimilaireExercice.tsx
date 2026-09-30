import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronRight } from "lucide-react";
import { API_URL } from "../config/api";
import { lireTexte, arreterLectureAudio } from "../utils/tts";
import { enregistrerResultat } from "../utils/resultats";
import ResultScreen from "./ResultScreen";
import { NIVEAU_LABEL } from "../utils/niveau";

interface Props {
	exercice: {
		id: number;
		titre: string;
		niveau: string;
		contenu: { groupes: string[][]; instructions?: string };
	};
}

type Phase = "serie" | "cible" | "reponse" | "feedback";

const TOTAL_QUESTIONS = 8;

/* Joue les mots de la série deux fois puis appelle onEnd */
const jouerSerie = (mots: string[], onEnd: () => void) => {
	const serie = [...mots, ...mots]; // x2
	const jouerMot = (i: number) => {
		if (i >= serie.length) { onEnd(); return; }
		lireTexte(API_URL, serie[i], () => setTimeout(() => jouerMot(i + 1), 400), 0.85);
	};
	jouerMot(0);
};

const tirerGroupes = (tous: string[][]): Array<{ mots: string[]; cible: string }> => {
	const melange = [...tous].sort(() => Math.random() - 0.5).slice(0, TOTAL_QUESTIONS);
	return melange.map(mots => ({
		mots,
		cible: mots[Math.floor(Math.random() * mots.length)],
	}));
};

const MotSimilaireExercice = ({ exercice }: Props) => {
	const navigate = useNavigate();
	const contenuParsed = typeof exercice.contenu === "string"
		? JSON.parse(exercice.contenu)
		: exercice.contenu;

	const [questions]               = useState(() => tirerGroupes(contenuParsed.groupes));
	const [index, setIndex]         = useState(0);
	const [phase, setPhase]         = useState<Phase>("serie");
	const [choix, setChoix]         = useState<string | null>(null);
	const [score, setScore]         = useState(0);
	const [ecran, setEcran]         = useState<"exercice" | "resultats">("exercice");
	const [jouant, setJouant]       = useState(false);

	const question = questions[index];
	const total = questions.length;

	/* Coupe l'audio TTS en cours si le composant est démonté (navigation, fermeture) */
	useEffect(() => () => arreterLectureAudio(), []);

	/* Lance la séquence audio complète : série x2 → pause → cible */
	const lancerSequence = useCallback(() => {
		if (!question || jouant) return;
		setJouant(true);
		setPhase("serie");
		jouerSerie(question.mots, () => {
			// Pause 800ms puis jouer la cible
			setTimeout(() => {
				setPhase("cible");
				lireTexte(API_URL, question.cible, () => {
					setPhase("reponse");
					setJouant(false);
				});
			}, 800);
		});
	}, [question, jouant]);

	/* Auto-play à chaque nouvelle question */
	useEffect(() => {
		setChoix(null);
		setPhase("serie");
		const t = setTimeout(() => lancerSequence(), 400);
		return () => clearTimeout(t);
	}, [index]);

	const valider = (mot: string) => {
		if (phase !== "reponse" || choix) return;
		setChoix(mot);
		if (mot === question.cible) setScore(s => s + 1);
		setPhase("feedback");
	};

	const suivant = async () => {
		if (index + 1 >= total) {
			await enregistrerResultat(exercice.id, Math.round((score / total) * 100));
			setEcran("resultats");
		} else {
			setIndex(i => i + 1);
		}
	};

	/* ── Résultats ── */
	if (ecran === "resultats") {
		const pct = Math.round((score / total) * 100);
		return <ResultScreen score={pct} bonnes={score} total={total} />;
	}

	if (!question) return null;

	const isCorrect = choix === question.cible;

	/* ── Exercice ── */
	return (
		<div className="rythme-page">
			<div className="ep-topbar">
				<button
					type="button"
					className="ep-close"
					onClick={() => { arreterLectureAudio(); navigate(-1); }}
					aria-label="Fermer"
				>
					<X size={18} strokeWidth={2.5} />
				</button>
				<div className="ep-progress" role="progressbar"
					aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={total}
					aria-label={`Question ${index + 1} sur ${total}`}>
					{Array.from({ length: total }).map((_, i) => (
						<div key={i} className={`ep-progress-dash${i < index ? " ep-progress-dash--actif" : i === index ? " ep-progress-dash--current" : ""}`} />
					))}
				</div>
				<span className="ep-progress-label">{index + 1} / {total}</span>
			</div>

			<div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center", marginTop: "0.5rem" }}>
				<span className={`badge badge--${exercice.niveau}`}>{NIVEAU_LABEL[exercice.niveau]}</span>
			</div>
			<p style={{ textAlign: "center", fontWeight: 700, marginTop: "0.25rem" }}>{exercice.titre}</p>
			<p className="rythme-instruction">Quel mot avez-vous entendu en dernier ?</p>

			{/* Zone lecture */}
			<div className="msim-play-area">
				<button
					type="button"
					className={`rythme-big-play${jouant ? " msim-play--active" : ""}`}
					onClick={lancerSequence}
					disabled={jouant}
					aria-label="Réécouter"
				>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
						<polygon points="5,3 19,12 5,21" />
					</svg>
				</button>

				{/* Indicateur de phase */}
				<div className="msim-phase" aria-live="polite">
					{phase === "serie"   && <span className="msim-phase-label msim-phase--serie">Série en cours…</span>}
					{phase === "cible"   && <span className="msim-phase-label msim-phase--cible">Écoutez le mot…</span>}
					{phase === "reponse" && <span className="msim-phase-label msim-phase--reponse">À vous !</span>}
					{phase === "feedback" && null}
					{!jouant && phase !== "reponse" && phase !== "feedback" && phase !== "serie" && phase !== "cible" && (
						<span className="msim-phase-label">Appuyer pour réécouter</span>
					)}
				</div>

				{/* Affichage des mots de la série */}
				<div className="msim-mots-serie" aria-hidden="true">
					{question.mots.map((mot, i) => (
						<span key={i} className={`msim-mot-serie${phase === "serie" ? " msim-mot--active" : ""}`}>
							{mot}
						</span>
					))}
				</div>
			</div>

			{/* Choix */}
			<div className="msim-choix" role="group" aria-label="Choisissez le mot entendu">
				{question.mots.map((mot) => {
					let cls = "dorth-btn";
					if (phase === "feedback") {
						if (mot === question.cible)  cls += " dorth-btn--correct";
						else if (mot === choix)       cls += " dorth-btn--incorrect";
						else                          cls += " dorth-btn--disabled";
					} else if (phase !== "reponse") {
						cls += " dorth-btn--locked";
					}
					return (
						<button
							key={mot}
							type="button"
							className={cls}
							onClick={() => valider(mot)}
							disabled={phase !== "reponse"}
						>
							{mot}
						</button>
					);
				})}
			</div>

			{phase === "feedback" ? (
				<div className={`ep-footer-feedback ${isCorrect ? "ep-footer-feedback--ok" : "ep-footer-feedback--ko"}`}>
					<p className="ep-footer-feedback-label">
						{isCorrect ? "Bonne réponse !" : `C'était : ${question.cible}`}
					</p>
					<button type="button" className="ep-btn-suivant-inline" onClick={suivant}>
						{index + 1 >= total ? "Voir mon score" : "Continuer"}
						<ChevronRight size={18} strokeWidth={2.5} />
					</button>
				</div>
			) : (
				<div style={{ height: "1.5rem", flexShrink: 0 }} />
			)}
		</div>
	);
};

export default MotSimilaireExercice;
