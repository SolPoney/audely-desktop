import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronRight } from "lucide-react";
import { API_URL } from "../config/api";
import { getUserId } from "../hooks/useAuth";

interface Props {
	exercice: {
		id: number;
		titre: string;
		niveau: string;
	};
}

type TypeSon = "grave" | "aigu";

interface Question {
	type: TypeSon;
}

const FREQS: Record<string, { grave: number; aigu: number }> = {
	facile:    { grave: 110,  aigu: 1760 },
	moyen:     { grave: 196,  aigu: 880  },
	difficile: { grave: 330,  aigu: 660  },
};

const genererQuestions = (): Question[] => {
	const types: TypeSon[] = [
		"grave", "grave", "grave", "grave", "grave",
		"aigu",  "aigu",  "aigu",  "aigu",  "aigu",
	];
	for (let i = types.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[types[i], types[j]] = [types[j], types[i]];
	}
	return types.map((type) => ({ type }));
};

const jouerTon = (freq: number, onEnd: () => void): () => void => {
	const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
	const osc  = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.type = "sine";
	osc.frequency.value = freq;
	const t = ctx.currentTime;
	gain.gain.setValueAtTime(0, t);
	gain.gain.linearRampToValueAtTime(0.35, t + 0.06);
	gain.gain.setValueAtTime(0.35, t + 0.85);
	gain.gain.linearRampToValueAtTime(0, t + 1.1);
	osc.start(t);
	osc.stop(t + 1.1);
	osc.onended = () => { ctx.close(); onEnd(); };
	return () => { osc.stop(); ctx.close(); };
};

const getMessage = (score: number, total: number) => {
	const r = score / total;
	if (r >= 1)    return "Score parfait ! Excellente discrimination !";
	if (r >= 0.75) return "Très bien ! Continuez comme ça !";
	if (r >= 0.5)  return "Pas mal ! Continuez à vous entraîner.";
	return "Ne vous découragez pas, réessayez !";
};

const TOTAL = 10;

const GraveAiguExercice = ({ exercice }: Props) => {
	const navigate = useNavigate();
	const stopRef  = useRef<(() => void) | null>(null);

	const [questions] = useState<Question[]>(genererQuestions);
	const [index, setIndex]       = useState(0);
	const [aEcoute, setAEcoute]   = useState(false);
	const [choix, setChoix]       = useState<TypeSon | null>(null);
	const [feedback, setFeedback] = useState<"ok" | "ko" | null>(null);
	const [score, setScore]       = useState(0);
	const [ecran, setEcran]       = useState<"exercice" | "resultats">("exercice");
	const [jouant, setJouant]     = useState(false);

	const question = questions[index];
	const freqs    = FREQS[exercice.niveau] ?? FREQS.facile;

	const stopSon = () => {
		if (stopRef.current) { stopRef.current(); stopRef.current = null; }
	};

	const jouer = useCallback(() => {
		if (jouant) return;
		stopSon();
		setJouant(true);
		const freq = freqs[question.type];
		stopRef.current = jouerTon(freq, () => {
			setAEcoute(true);
			setJouant(false);
		});
	}, [jouant, question, freqs]);

	useEffect(() => {
		setAEcoute(false);
		setChoix(null);
		setFeedback(null);
		const t = setTimeout(() => jouer(), 500);
		return () => { clearTimeout(t); stopSon(); };
	}, [index]);

	useEffect(() => () => stopSon(), []);

	const valider = () => {
		if (!choix || feedback || !aEcoute) return;
		stopSon();
		const correct = choix === question.type;
		if (correct) setScore(s => s + 1);
		setFeedback(correct ? "ok" : "ko");
	};

	const suivant = async () => {
		if (index + 1 >= TOTAL) {
			const token = localStorage.getItem("token");
			await fetch(`${API_URL}/api/resultats`, {
				method: "POST",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
				body: JSON.stringify({
					id_utilisateur: getUserId(),
					id_exercice: exercice.id,
					score: Math.round((score / TOTAL) * 100),
				}),
			});
			setEcran("resultats");
		} else {
			setIndex(i => i + 1);
		}
	};

	/* ── Résultats ── */
	if (ecran === "resultats") {
		const pct = Math.round((score / TOTAL) * 100);
		return (
			<div className="det-result">
				<h1 className="det-result-score">
					{score} / {TOTAL} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}
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
				<p className="det-result-message">{getMessage(score, TOTAL)}</p>
				<div className="det-result-actions">
					<button type="button" className="det-btn-outline" onClick={() => { stopSon(); navigate(-1); }}>Retour aux exercices</button>
					<button type="button" className="det-btn-noir" onClick={() => navigate("/dashboard")}>Continuer</button>
				</div>
			</div>
		);
	}

	/* ── Exercice ── */
	return (
		<div className="rythme-page">
			<div className="ep-topbar">
				<button
					type="button"
					className="ep-close"
					onClick={() => { stopSon(); navigate(-1); }}
					aria-label="Fermer"
				>
					<X size={18} strokeWidth={2.5} />
				</button>
				<div
					className="ep-progress"
					role="progressbar"
					aria-valuenow={index + 1}
					aria-valuemin={1}
					aria-valuemax={TOTAL}
					aria-label={`Question ${index + 1} sur ${TOTAL}`}
				>
					{Array.from({ length: TOTAL }).map((_, i) => (
						<div key={i} className={`ep-progress-dash${i < index ? " ep-progress-dash--actif" : i === index ? " ep-progress-dash--current" : ""}`} />
					))}
				</div>
				<span className="ep-progress-label">{index + 1} / {TOTAL}</span>
			</div>

			<p className="rythme-instruction">GRAVE OU AIGU ?</p>

			<div className="rythme-play-area">
				<button
					type="button"
					className="rythme-big-play"
					onClick={jouer}
					disabled={jouant}
					aria-label="Écouter le son"
				>
					<svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden="true">
						<polygon points="5,3 19,12 5,21" />
					</svg>
				</button>
				<p className="rythme-play-hint">
					{jouant ? "Écoute en cours…" : aEcoute ? "Appuyer pour réécouter" : "Écoute en cours…"}
				</p>
			</div>

			<div className="rythme-reponses rythme-reponses--row" role="group" aria-label="Choisissez une réponse">
				{(["grave", "aigu"] as TypeSon[]).map((option) => {
					let cls = "rythme-reponse-card";
					if (feedback) {
						if (option === question.type)   cls += " rythme-reponse-card--correct";
						else if (option === choix)      cls += " rythme-reponse-card--incorrect";
					} else if (!aEcoute) {
						cls += " rythme-reponse-card--locked";
					} else if (choix === option) {
						cls += " rythme-reponse-card--select";
					}
					return (
						<button
							key={option}
							type="button"
							className={cls}
							onClick={() => !feedback && aEcoute && setChoix(option)}
							disabled={!aEcoute || !!feedback}
							aria-pressed={choix === option}
						>
							<div className="rythme-reponse-icone" aria-hidden="true">
								{option === "grave" ? (
									<svg width="62" height="28" viewBox="0 0 62 28">
										<path d="M1,14 Q16,22 31,14 Q46,6 61,14"
											stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
									</svg>
								) : (
									<svg width="62" height="28" viewBox="0 0 62 28">
										<path d="M1,14 Q8,2 15,14 Q22,26 29,14 Q36,2 43,14 Q50,26 57,14 Q59,10 61,14"
											stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
									</svg>
								)}
							</div>
							<p className="rythme-reponse-label">
								{option === "grave" ? "Grave" : "Aigu"}
							</p>
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
						{index + 1 >= TOTAL ? "Voir mon score" : "Continuer"}
						<ChevronRight size={18} strokeWidth={2.5} />
					</button>
				</div>
			) : (
				<div className="rythme-footer">
					<button
						type="button"
						className={`rythme-btn-gris${choix && aEcoute ? " rythme-btn-gris--actif" : ""}`}
						onClick={valider}
						disabled={!choix || !aEcoute}
					>
						Valider
					</button>
				</div>
			)}
		</div>
	);
};

export default GraveAiguExercice;
