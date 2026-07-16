import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Volume2, ChevronRight } from "lucide-react";
import { API_URL } from "../config/api";
import { getUserId } from "../hooks/useAuth";

interface Props {
	exercice: {
		id: number;
		titre: string;
		niveau: string;
		contenu: any;
	};
}

type TypeSon = "grave" | "aigu";

interface QuestionGA {
	mot: string;
	type: TypeSon;
}

/* Génère les questions en tirant aléatoirement grave/aigu pour chaque mot */
const genererQuestions = (contenu: any): QuestionGA[] => {
	const parsed = typeof contenu === "string" ? JSON.parse(contenu) : contenu;
	const items: string[] = parsed?.mots ?? parsed?.syllabes ?? [];
	return items.map((mot) => ({
		mot,
		type: (Math.random() > 0.5 ? "grave" : "aigu") as TypeSon,
	}));
};

const getMessage = (score: number, total: number) => {
	const r = score / total;
	if (r >= 1)    return "Score parfait ! Excellente discrimination !";
	if (r >= 0.75) return "Très bien ! Poursuivez vos efforts !";
	if (r >= 0.5)  return "Pas mal ! Continuez à vous entraîner.";
	return "Ne vous découragez pas, réessayez !";
};

/* playbackRate : 0.65 = voix grave, 1.5 = voix aiguë */
const RATE: Record<TypeSon, number> = { grave: 0.65, aigu: 1.5 };

let audioEnCours: HTMLAudioElement | null = null;

const stopAll = () => {
	if (audioEnCours) { audioEnCours.pause(); audioEnCours.src = ""; audioEnCours = null; }
};

const lire = (texte: string, type: TypeSon, onEnd?: () => void) => {
	stopAll();
	const audio = new Audio(`${API_URL}/api/tts?q=${encodeURIComponent(texte)}`);
	audio.playbackRate = RATE[type];
	audioEnCours = audio;
	if (onEnd) audio.addEventListener("ended", onEnd, { once: true });
	audio.play().catch(() => { if (onEnd) onEnd(); });
};

const GraveAiguExercice = ({ exercice }: Props) => {
	const navigate = useNavigate();
	const contenuParsed = typeof exercice.contenu === "string"
		? JSON.parse(exercice.contenu)
		: exercice.contenu;

	const [questions] = useState<QuestionGA[]>(() => genererQuestions(contenuParsed));
	const [index, setIndex]       = useState(0);
	const [aEcoute, setAEcoute]   = useState(false);
	const [choix, setChoix]       = useState<TypeSon | null>(null);
	const [feedback, setFeedback] = useState<"ok" | "ko" | null>(null);
	const [score, setScore]       = useState(0);
	const [ecran, setEcran]       = useState<"exercice" | "resultats">("exercice");
	const [jouant, setJouant]     = useState(false);

	const total    = questions.length;
	const question = questions[index];

	const jouer = useCallback(() => {
		if (!question || jouant) return;
		setJouant(true);
		lire(question.mot, question.type, () => {
			setAEcoute(true);
			setJouant(false);
		});
	}, [question, jouant]);

	/* Lecture auto à chaque nouvelle question */
	useEffect(() => {
		setAEcoute(false);
		setChoix(null);
		setFeedback(null);
		const t = setTimeout(() => jouer(), 400);
		return () => clearTimeout(t);
	}, [index]);

	/* Nettoyage au démontage */
	useEffect(() => () => stopAll(), []);

	const valider = (option: TypeSon) => {
		if (feedback) return;
		setChoix(option);
		const correct = option === question.type;
		if (correct) setScore(s => s + 1);
		setFeedback(correct ? "ok" : "ko");
	};

	const suivant = async () => {
		if (index + 1 >= total) {
			const finalScore = score + (feedback === "ok" ? 1 : 0);
			const token = localStorage.getItem("token");
			await fetch(`${API_URL}/api/resultats`, {
				method: "POST",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
				body: JSON.stringify({
					id_utilisateur: getUserId(),
					id_exercice: exercice.id,
					score: Math.round((finalScore / total) * 100),
				}),
			});
			setScore(finalScore);
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
				<p className="det-result-message">{getMessage(score, total)}</p>
				<div className="det-result-actions">
					<button className="det-btn-outline" onClick={() => navigate(-1)}>Retour aux exercices</button>
					<button className="det-btn-noir" onClick={() => navigate("/dashboard")}>Continuer</button>
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
					className="ep-close"
					onClick={() => { stopAll(); navigate(-1); }}
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

			<p className="dorth-instruction">GRAVE OU AIGU ?</p>

			<div className="dorth-card-area">
				<div className="dorth-card">
					<button
						type="button"
						className={`ep-play-btn${jouant ? " ep-play-btn--playing" : ""}`}
						onClick={jouer}
						aria-label="Écouter le son"
					>
						<Volume2 size={20} strokeWidth={1.8} />
						{jouant ? "Écoute…" : "Écouter"}
					</button>
					{!aEcoute && !jouant && (
						<p className="dorth-hint">Appuyez sur Écouter pour entendre le mot</p>
					)}
				</div>
			</div>

			<div className="ga-choix">
				{(["grave", "aigu"] as TypeSon[]).map((option) => {
					let cls = "ga-btn";
					if (feedback) {
						if (option === question.type)   cls += " ga-btn--correct";
						else if (option === choix)      cls += " ga-btn--incorrect";
					} else if (!aEcoute) {
						cls += " ga-btn--locked";
					} else if (choix === option) {
						cls += " ga-btn--selected";
					}
					return (
						<button
							key={option}
							type="button"
							className={cls}
							onClick={() => valider(option)}
							disabled={!aEcoute || !!feedback}
						>
							<span className="ga-btn-icon" aria-hidden="true">
								{option === "grave" ? (
									<svg width="44" height="28" viewBox="0 0 44 28">
										<path d="M2,10 Q22,22 42,10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
									</svg>
								) : (
									<svg width="44" height="28" viewBox="0 0 44 28">
										<path d="M2,18 Q22,6 42,18" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
									</svg>
								)}
							</span>
							<span className="ga-btn-label">{option === "grave" ? "Grave" : "Aigu"}</span>
							<span className="ga-btn-sub">{option === "grave" ? "Son bas, profond" : "Son haut, perçant"}</span>
						</button>
					);
				})}
			</div>

			{feedback ? (
				<div className={`ep-footer-feedback ${feedback === "ok" ? "ep-footer-feedback--ok" : "ep-footer-feedback--ko"}`}>
					<p className="ep-footer-feedback-label">
						{feedback === "ok" ? "Bonne réponse !" : `C'était un son ${question.type}`}
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

export default GraveAiguExercice;
