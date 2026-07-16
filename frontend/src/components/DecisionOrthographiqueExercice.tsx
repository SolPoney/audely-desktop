import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import { getUserId } from "../hooks/useAuth";
import { X, Volume2, ChevronRight } from "lucide-react";
import ResultScreen from "./ResultScreen";

interface MotItem {
	mot: string;        // la bonne réponse, lue par TTS
	choix: string[];    // 3 options dont la bonne
}

interface Props {
	exercice: {
		id: number;
		titre: string;
		niveau: string;
		contenu: { mots: MotItem[]; instructions?: string };
	};
}

/* TTS */
let audioEnCours: HTMLAudioElement | null = null;

const lire = (texte: string, onEnd?: () => void) => {
	if (audioEnCours) { audioEnCours.pause(); audioEnCours.src = ""; audioEnCours = null; }
	const audio = new Audio(`${API_URL}/api/tts?q=${encodeURIComponent(texte)}`);
	audioEnCours = audio;
	if (onEnd) audio.addEventListener("ended", onEnd, { once: true });
	audio.play().catch(() => {
		if (!window.speechSynthesis) return;
		window.speechSynthesis.cancel();
		const utt = new SpeechSynthesisUtterance(texte);
		utt.lang = "fr-FR"; utt.rate = 0.88;
		if (onEnd) utt.addEventListener("end", onEnd, { once: true });
		window.speechSynthesis.speak(utt);
	});
};

const getMessage = (score: number, total: number) => {
	const r = score / total;
	if (r >= 1)    return "Score parfait ! Excellente discrimination !";
	if (r >= 0.75) return "Très bien ! Poursuivez vos efforts !";
	if (r >= 0.5)  return "Pas mal ! Continuez à vous entraîner.";
	return "Ne vous découragez pas, réessayez !";
};

const DecisionOrthographiqueExercice = ({ exercice }: Props) => {
	const navigate = useNavigate();
	const contenuParsed = typeof exercice.contenu === "string"
		? JSON.parse(exercice.contenu)
		: exercice.contenu;
	const mots: MotItem[] = contenuParsed?.mots ?? [];
	const total = mots.length;

	const [ecran, setEcran]         = useState<"exercice" | "resultats">("exercice");
	const [index, setIndex]         = useState(0);
	const [aEcoute, setAEcoute]     = useState(false);
	const [choix, setChoix]         = useState<string | null>(null);
	const [feedback, setFeedback]   = useState<"ok" | "ko" | null>(null);
	const [score, setScore]         = useState(0);
	const [jouant, setJouant]       = useState(false);

	const question = mots[index];

	const jouer = useCallback(() => {
		if (!question || jouant) return;
		setJouant(true);
		lire(question.mot, () => {
			setAEcoute(true);
			setJouant(false);
		});
	}, [question, jouant]);

	// Lecture auto à chaque nouvelle question
	useEffect(() => {
		setAEcoute(false);
		setChoix(null);
		setFeedback(null);
		const timer = setTimeout(() => jouer(), 350);
		return () => clearTimeout(timer);
	}, [index]);

	const valider = (option: string) => {
		if (feedback) return;
		setChoix(option);
		const correct = option === question.mot;
		setFeedback(correct ? "ok" : "ko");
		if (correct) setScore(s => s + 1);
	};

	const suivant = async () => {
		if (index + 1 >= total) {
			// Enregistrer le résultat
			const token = localStorage.getItem("token");
			await fetch(`${API_URL}/api/resultats`, {
				method: "POST",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
				body: JSON.stringify({
					id_utilisateur: getUserId(),
					id_exercice: exercice.id,
					score: Math.round((score + (feedback === "ok" ? 1 : 0)) / total * 100),
				}),
			});
			setScore(s => s + (feedback === "ok" ? 1 : 0));
			setEcran("resultats");
		} else {
			setIndex(i => i + 1);
		}
	};

	/* ── Écran résultats ── */
	if (ecran === "resultats") {
		const finalScore = score;
		return (
			<div className="det-result">
				<h1 className="det-result-score">
					{finalScore} / {total} bonne{finalScore > 1 ? "s" : ""} réponse{finalScore > 1 ? "s" : ""}.
				</h1>
				<div className="ep-result-ring" aria-hidden="true">
					<svg viewBox="0 0 120 120" width="180" height="180">
						<circle cx="60" cy="60" r="50" fill="none" stroke="#E2E8F0" strokeWidth="10" />
						<circle
							cx="60" cy="60" r="50"
							fill="none" stroke="#0D9488" strokeWidth="10"
							strokeLinecap="round"
							strokeDasharray={2 * Math.PI * 50}
							strokeDashoffset={2 * Math.PI * 50 * (1 - finalScore / total)}
							transform="rotate(-90 60 60)"
						/>
						<text x="60" y="55" textAnchor="middle" fontSize="20" fontWeight="800" fill="#0F172A">
							{Math.round(finalScore / total * 100)}%
						</text>
						<text x="60" y="75" textAnchor="middle" fontSize="11" fill="#64748B">Score</text>
					</svg>
				</div>
				<p className="det-result-message">{getMessage(finalScore, total)}</p>
				<div className="det-result-actions">
					<button className="det-btn-outline" onClick={() => navigate(-1)}>
						Retour aux exercices
					</button>
					<button className="det-btn-noir" onClick={() => navigate("/dashboard")}>
						Continuer
					</button>
				</div>
			</div>
		);
	}

	if (!question) return null;

	/* ── Écran exercice ── */
	return (
		<div className="dorth-page">
			{/* Topbar */}
			<div className="ep-topbar">
				<button
					className="ep-close"
					onClick={() => { if (audioEnCours) { audioEnCours.pause(); audioEnCours = null; } navigate(-1); }}
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

			{/* Instruction */}
			<p className="dorth-instruction">DE QUOI S'AGIT-IL ?</p>

			{/* Carte centrale */}
			<div className="dorth-card-area">
				<div className="dorth-card">
					<button
						type="button"
						className={`ep-play-btn${jouant ? " ep-play-btn--playing" : ""}`}
						onClick={jouer}
						aria-label="Écouter le mot"
					>
						<Volume2 size={20} strokeWidth={1.8} />
						{jouant ? "Écoute…" : "Écouter"}
					</button>

					{!aEcoute && !jouant && (
						<p className="dorth-hint">Appuyez sur Écouter pour entendre le mot</p>
					)}
				</div>
			</div>

			{/* Choix */}
			<div className="dorth-choix">
				{question.choix.map((option) => {
					let cls = "dorth-btn";
					if (feedback) {
						if (option === question.mot)    cls += " dorth-btn--correct";
						else if (option === choix)      cls += " dorth-btn--incorrect";
						else                            cls += " dorth-btn--disabled";
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

			{/* Feedback bar */}
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
				<div className="ep-footer-spacer" />
			)}
		</div>
	);
};

export default DecisionOrthographiqueExercice;
