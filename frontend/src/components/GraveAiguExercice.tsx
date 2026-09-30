import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronRight } from "lucide-react";
import { enregistrerResultat } from "../utils/resultats";
import ResultScreen from "./ResultScreen";
import { NIVEAU_LABEL } from "../utils/niveau";

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

// 110 Hz était trop grave pour être bien reproduit par les petits haut-parleurs
// (téléphone, ordinateur portable) : remonté à 165 Hz, toujours nettement grave
// face à 1760 Hz mais beaucoup plus audible dans de bonnes conditions.
const FREQS: Record<string, { grave: number; aigu: number }> = {
	facile:    { grave: 165,  aigu: 1760 },
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
	const t = ctx.currentTime;
	const oscillateurs: OscillatorNode[] = [];

	const creerVoix = (frequence: number, volumeMax: number) => {
		const osc  = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.type = "sine";
		osc.frequency.value = frequence;
		gain.gain.setValueAtTime(0, t);
		gain.gain.linearRampToValueAtTime(volumeMax, t + 0.06);
		gain.gain.setValueAtTime(volumeMax, t + 0.85);
		gain.gain.linearRampToValueAtTime(0, t + 1.1);
		osc.start(t);
		osc.stop(t + 1.1);
		oscillateurs.push(osc);
		return osc;
	};

	// Les sons graves sont perçus plus faiblement à volume égal (courbes
	// isosoniques) et mal reproduits par les petits haut-parleurs : on
	// compense en augmentant le volume, et on ajoute une harmonique (2x la
	// fréquence) pour les sons vraiment graves — l'oreille perçoit toujours
	// la hauteur d'origine, mais l'énergie sonore tombe dans une plage que
	// les petits haut-parleurs reproduisent mieux.
	const volume = freq < 200 ? 0.6 : freq < 400 ? 0.45 : 0.35;
	const principal = creerVoix(freq, volume);
	if (freq < 200) creerVoix(freq * 2, volume * 0.4);

	principal.onended = () => { ctx.close(); onEnd(); };
	return () => { oscillateurs.forEach((osc) => osc.stop()); ctx.close(); };
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
			await enregistrerResultat(exercice.id, Math.round((score / TOTAL) * 100));
			setEcran("resultats");
		} else {
			setIndex(i => i + 1);
		}
	};

	/* ── Résultats ── */
	if (ecran === "resultats") {
		const pct = Math.round((score / TOTAL) * 100);
		return <ResultScreen score={pct} bonnes={score} total={TOTAL} />;
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

			<div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center", marginTop: "0.5rem" }}>
				<span className={`badge badge--${exercice.niveau}`}>{NIVEAU_LABEL[exercice.niveau]}</span>
			</div>
			<p className="rythme-instruction">{exercice.titre.toUpperCase()}</p>

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
