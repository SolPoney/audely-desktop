import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import { X, ChevronRight } from "lucide-react";
import { lireTexte, arreterLectureAudio } from "../utils/tts";
import { getFeedbackMessage } from "../utils/feedback";
import { enregistrerResultat } from "../utils/resultats";

interface MotItem {
	mot: string;
	choix: string[];
}

interface Props {
	exercice: {
		id: number;
		titre: string;
		niveau: string;
		contenu: { mots: MotItem[]; instructions?: string };
	};
}

const DecisionOrthographiqueExercice = ({ exercice }: Props) => {
	const navigate = useNavigate();
	const contenuParsed = typeof exercice.contenu === "string"
		? JSON.parse(exercice.contenu)
		: exercice.contenu;
	const mots: MotItem[] = contenuParsed?.mots ?? [];
	const total = mots.length;

	const [ecran, setEcran]       = useState<"exercice" | "resultats">("exercice");
	const [index, setIndex]       = useState(0);
	const [aEcoute, setAEcoute]   = useState(false);
	const [choix, setChoix]       = useState<string | null>(null);
	const [feedback, setFeedback] = useState<"ok" | "ko" | null>(null);
	const [score, setScore]       = useState(0);
	const [jouant, setJouant]     = useState(false);

	const question = mots[index];

	const jouer = useCallback(() => {
		if (!question || jouant) return;
		setJouant(true);
		lireTexte(API_URL, question.mot, () => {
			setAEcoute(true);
			setJouant(false);
		});
	}, [question, jouant]);

	useEffect(() => {
		setAEcoute(false);
		setChoix(null);
		setFeedback(null);
		const timer = setTimeout(() => jouer(), 350);
		return () => clearTimeout(timer);
	}, [index]);

	const valider = (option: string) => {
		if (feedback || !aEcoute) return;
		setChoix(option);
		const correct = option === question.mot;
		if (correct) setScore(s => s + 1);
		setFeedback(correct ? "ok" : "ko");
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
		return (
			<div className="det-result">
				<h1 className="det-result-score">
					{score} / {total} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}
				</h1>
				<div className="ep-result-ring" aria-hidden="true">
					<svg viewBox="0 0 120 120" width="180" height="180">
						<circle cx="60" cy="60" r="50" fill="none" stroke="#E2E8F0" strokeWidth="10" />
						<circle
							cx="60" cy="60" r="50"
							fill="none" stroke="#0D9488" strokeWidth="10"
							strokeLinecap="round"
							strokeDasharray={2 * Math.PI * 50}
							strokeDashoffset={2 * Math.PI * 50 * (1 - pct / 100)}
							transform="rotate(-90 60 60)"
						/>
						<text x="60" y="55" textAnchor="middle" fontSize="20" fontWeight="800" fill="#0F172A">{pct}%</text>
						<text x="60" y="75" textAnchor="middle" fontSize="11" fill="#64748B">Score</text>
					</svg>
				</div>
				<p className="det-result-message">{getFeedbackMessage(score, total)}</p>
				<div className="det-result-actions">
					<button type="button" className="det-btn-outline" onClick={() => { arreterLectureAudio(); navigate(-1); }}>
						Retour aux exercices
					</button>
					<button type="button" className="det-btn-noir" onClick={() => navigate("/dashboard")}>
						Continuer
					</button>
				</div>
			</div>
		);
	}

	if (!question) return null;

	/* ── Exercice ── */
	return (
		<div className="dorth-page">
			<div className="ep-topbar">
				<button
					type="button"
					className="ep-close"
					onClick={() => { arreterLectureAudio(); navigate(-1); }}
					aria-label="Fermer"
				>
					<X size={18} strokeWidth={2.5} />
				</button>
				<div
					className="ep-progress"
					role="progressbar"
					aria-valuenow={index + 1}
					aria-valuemin={1}
					aria-valuemax={total}
					aria-label={`Question ${index + 1} sur ${total}`}
				>
					{Array.from({ length: Math.min(total, 12) }).map((_, i) => (
						<div key={i} className={`ep-progress-dash${i < index ? " ep-progress-dash--actif" : i === index ? " ep-progress-dash--current" : ""}`} />
					))}
				</div>
				<span className="ep-progress-label">{index + 1} / {total}</span>
			</div>

			<p className="dorth-instruction">Quel mot avez-vous entendu ?</p>

			<div className="dorth-card-area">
				<div className={`dorth-play-wrap${jouant ? " dorth-play-wrap--playing" : ""}`}>
					<button
						type="button"
						className={`rythme-big-play${jouant ? " dorth-play--on" : ""}`}
						onClick={jouer}
						disabled={jouant}
						aria-label="Écouter le mot"
					>
						<svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden="true">
							<polygon points="5,3 19,12 5,21" />
						</svg>
					</button>
				</div>
				<div className={`dorth-waveform${jouant ? " dorth-waveform--playing" : " dorth-waveform--idle"}`} aria-hidden="true">
					{[1,2,3,4,5,6,7].map(i => <div key={i} className="dorth-waveform-bar" />)}
				</div>
				<p className="rythme-play-hint">
					{jouant ? "Écoute en cours…" : aEcoute ? "Appuyer pour réécouter" : "Écoute en cours…"}
				</p>
			</div>

			<div className="dorth-choix">
				{question.choix.map((option) => {
					let cls = "dorth-btn";
					if (feedback) {
						if (option === question.mot)  cls += " dorth-btn--correct";
						else if (option === choix)    cls += " dorth-btn--incorrect";
						else                          cls += " dorth-btn--disabled";
					} else if (!aEcoute) {
						cls += " dorth-btn--locked";
					}
					return (
						<button
							key={option}
							type="button"
							className={cls}
							onClick={() => valider(option)}
							disabled={!aEcoute || !!feedback}
						>
							{option}
						</button>
					);
				})}
			</div>

			{feedback ? (
				<div className={`ep-footer-feedback ${feedback === "ok" ? "ep-footer-feedback--ok" : "ep-footer-feedback--ko"}`}>
					<p className="ep-footer-feedback-label">
						{feedback === "ok" ? "Bonne réponse !" : `C'était : ${question.mot}`}
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

export default DecisionOrthographiqueExercice;
