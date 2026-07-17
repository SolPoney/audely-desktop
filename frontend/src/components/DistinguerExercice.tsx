import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, Equal, Divide, ChevronRight } from "lucide-react";
import { API_URL } from "../config/api";
import { getUserId } from "../hooks/useAuth";

interface Props {
	exercice: { id: number; titre: string; niveau: string };
}

type Reponse = "identique" | "different";

const TOTAL_QUESTIONS = 5;

const jouerSon = (ctx: AudioContext, frequence: number) => {
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.type = "sine";
	osc.frequency.value = frequence;
	const t = ctx.currentTime + 0.05;
	gain.gain.setValueAtTime(0, t);
	gain.gain.linearRampToValueAtTime(0.45, t + 0.08);
	gain.gain.setValueAtTime(0.45, t + 0.7);
	gain.gain.linearRampToValueAtTime(0, t + 0.9);
	osc.start(t);
	osc.stop(t + 1);
};

const FREQUENCES = [330, 392, 440, 523, 587, 660, 784];

const tirerQuestion = (): { sonA: number; sonB: number; reponseCorrecte: Reponse } => {
	const freqA = FREQUENCES[Math.floor(Math.random() * FREQUENCES.length)];
	const identique = Math.random() > 0.5;
	if (identique) return { sonA: freqA, sonB: freqA, reponseCorrecte: "identique" };
	let freqB = freqA;
	while (freqB === freqA) {
		freqB = FREQUENCES[Math.floor(Math.random() * FREQUENCES.length)];
	}
	return { sonA: freqA, sonB: freqB, reponseCorrecte: "different" };
};

const getMessage = (nb: number) => {
	const r = nb / TOTAL_QUESTIONS;
	if (r >= 1)    return "Score parfait ! Excellente discrimination !";
	if (r >= 0.75) return "Très bien ! Poursuivez vos efforts !";
	if (r >= 0.5)  return "Pas mal ! Continuez à vous entraîner.";
	return "Ne vous découragez pas, réessayez !";
};

const DistinguerExercice = ({ exercice }: Props) => {
	const navigate = useNavigate();
	const [ecran, setEcran]           = useState<"exercice" | "resultats">("exercice");
	const [question, setQuestion]     = useState(tirerQuestion());
	const [questionNum, setQuestionNum] = useState(1);
	const [reponse, setReponse]       = useState<Reponse | null>(null);
	const [feedback, setFeedback]     = useState<"ok" | "ko" | null>(null);
	const [score, setScore]           = useState(0);
	const [sonAJoue, setSonAJoue]     = useState(false);
	const [sonBJoue, setSonBJoue]     = useState(false);
	const ctxRef = useRef<AudioContext | null>(null);

	const getCtxResume = async () => {
		const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
		await ctx.resume();
		ctxRef.current = ctx;
		return ctx;
	};

	const jouerSonA = async () => {
		const ctx = await getCtxResume();
		jouerSon(ctx, question.sonA);
		setSonAJoue(true);
	};

	const jouerSonB = async () => {
		const ctx = await getCtxResume();
		jouerSon(ctx, question.sonB);
		setSonBJoue(true);
	};

	const valider = () => {
		if (!reponse || feedback) return;
		const correct = reponse === question.reponseCorrecte;
		if (correct) setScore(s => s + 1);
		setFeedback(correct ? "ok" : "ko");
	};

	const suivant = async () => {
		if (questionNum >= TOTAL_QUESTIONS) {
			const token = localStorage.getItem("token");
			await fetch(`${API_URL}/api/resultats`, {
				method: "POST",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
				body: JSON.stringify({
					id_utilisateur: getUserId(),
					id_exercice: exercice.id,
					score: Math.round((score / TOTAL_QUESTIONS) * 100),
				}),
			});
			setEcran("resultats");
		} else {
			setQuestionNum(n => n + 1);
			setQuestion(tirerQuestion());
			setReponse(null);
			setFeedback(null);
			setSonAJoue(false);
			setSonBJoue(false);
		}
	};

	/* ── Résultats ── */
	if (ecran === "resultats") {
		const pct = Math.round((score / TOTAL_QUESTIONS) * 100);
		return (
			<div className="det-result">
				<h1 className="det-result-score">
					{score} / {TOTAL_QUESTIONS} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}
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
				<p className="det-result-message">{getMessage(score)}</p>
				<div className="det-result-actions">
					<button type="button" className="det-btn-outline" onClick={() => navigate(-1)}>Retour aux exercices</button>
					<button type="button" className="det-btn-noir" onClick={() => navigate("/dashboard")}>Continuer</button>
				</div>
			</div>
		);
	}

	/* ── Exercice ── */
	const peutEcouter = sonAJoue && sonBJoue;

	return (
		<div className="rythme-page">
			<div className="ep-topbar">
				<button type="button" className="ep-close" onClick={() => navigate(-1)} aria-label="Fermer">
					<X size={18} strokeWidth={2.5} />
				</button>
				<div className="ep-progress" role="progressbar"
					aria-valuenow={questionNum} aria-valuemin={1} aria-valuemax={TOTAL_QUESTIONS}
					aria-label={`Question ${questionNum} sur ${TOTAL_QUESTIONS}`}>
					{Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
						<div key={i} className={`ep-progress-dash${i < questionNum - 1 ? " ep-progress-dash--actif" : i === questionNum - 1 ? " ep-progress-dash--current" : ""}`} />
					))}
				</div>
				<span className="ep-progress-label">{questionNum} / {TOTAL_QUESTIONS}</span>
			</div>

			<p className="rythme-instruction">IDENTIQUE OU DIFFÉRENT ?</p>

			{/* Deux boutons play */}
			<div className="distinguer-plays">
				<div className="distinguer-play-item">
					<button type="button"
						className={`rythme-big-play distinguer-play-btn${sonAJoue ? " distinguer-play-btn--joue" : ""}`}
						onClick={jouerSonA}
						aria-label="Écouter le son A">
						<svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden="true">
							<polygon points="5,3 19,12 5,21" />
						</svg>
					</button>
					<p className="rythme-play-hint" style={{ fontWeight: 700, fontSize: "1rem" }}>Son A</p>
				</div>
				<div className="distinguer-play-item">
					<button type="button"
						className={`rythme-big-play distinguer-play-btn${sonBJoue ? " distinguer-play-btn--joue" : ""}`}
						onClick={jouerSonB}
						aria-label="Écouter le son B">
						<svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden="true">
							<polygon points="5,3 19,12 5,21" />
						</svg>
					</button>
					<p className="rythme-play-hint" style={{ fontWeight: 700, fontSize: "1rem" }}>Son B</p>
				</div>
			</div>

			{!peutEcouter && (
				<p className="distinguer-hint">Écoutez les deux sons avant de répondre</p>
			)}

			<div className="rythme-reponses rythme-reponses--row" role="group" aria-label="Choisissez une réponse">
				{([
					{ val: "identique" as Reponse, label: "Identiques", sub: "Les deux sons sont pareils", Icon: Equal },
					{ val: "different"  as Reponse, label: "Différents",  sub: "Les sons ne sont pas pareils",  Icon: Divide },
				]).map(({ val, label, sub, Icon }) => {
					let cls = "rythme-reponse-card";
					if (feedback) {
						if (val === question.reponseCorrecte) cls += " rythme-reponse-card--correct";
						else if (val === reponse)             cls += " rythme-reponse-card--incorrect";
					} else if (!peutEcouter) {
						cls += " rythme-reponse-card--locked";
					} else if (reponse === val) {
						cls += " rythme-reponse-card--select";
					}
					return (
						<button key={val} type="button" className={cls}
							onClick={() => !feedback && peutEcouter && setReponse(val)}
							disabled={!peutEcouter || !!feedback}
							aria-pressed={reponse === val}>
							<div className="rythme-reponse-icone" aria-hidden="true">
								<Icon size={40} strokeWidth={2.5}
									color={reponse === val || (feedback && val === question.reponseCorrecte) ? "#0D9488" : "#64748B"} />
							</div>
							<div className="rythme-reponse-body">
								<p className="rythme-reponse-label">{label}</p>
								<p className="rythme-reponse-sub">{sub}</p>
							</div>
						</button>
					);
				})}
			</div>

			{feedback ? (
				<div className={`ep-footer-feedback ${feedback === "ok" ? "ep-footer-feedback--ok" : "ep-footer-feedback--ko"}`}>
					<p className="ep-footer-feedback-label">
						{feedback === "ok"
							? "Bonne réponse !"
							: `C'était : ${question.reponseCorrecte === "identique" ? "Identiques" : "Différents"}`}
					</p>
					<button type="button" className="ep-btn-suivant-inline" onClick={suivant}>
						{questionNum >= TOTAL_QUESTIONS ? "Voir mon score" : "Continuer"}
						<ChevronRight size={18} strokeWidth={2.5} />
					</button>
				</div>
			) : (
				<div className="rythme-footer">
					<button type="button"
						className={`rythme-btn-gris${reponse && peutEcouter ? " rythme-btn-gris--actif" : ""}`}
						onClick={valider}
						disabled={!reponse || !peutEcouter}>
						Valider
					</button>
				</div>
			)}
		</div>
	);
};

export default DistinguerExercice;
