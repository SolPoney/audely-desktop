import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronRight } from "lucide-react";
import { API_URL } from "../config/api";
import { getUserId } from "../hooks/useAuth";

interface Props {
	exercice: { id: number; titre: string; niveau: string };
}

type Ecran = "preparation" | "exercice" | "resultats";
type TypeSon = "saccade" | "continu";

const jouerSonSaccade = (ctx: AudioContext) => {
	for (let i = 0; i < 5; i++) {
		const osc  = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.type = "sine";
		osc.frequency.value = 660;
		const debut = ctx.currentTime + 0.1 + i * 0.22;
		gain.gain.setValueAtTime(0, debut);
		gain.gain.linearRampToValueAtTime(0.45, debut + 0.02);
		gain.gain.setValueAtTime(0.45, debut + 0.08);
		gain.gain.linearRampToValueAtTime(0, debut + 0.1);
		osc.start(debut);
		osc.stop(debut + 0.12);
	}
};

const jouerSonContinu = (ctx: AudioContext) => {
	const osc  = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.type = "sine";
	osc.frequency.value = 440;
	const debut = ctx.currentTime + 0.1;
	gain.gain.setValueAtTime(0, debut);
	gain.gain.linearRampToValueAtTime(0.45, debut + 0.15);
	gain.gain.setValueAtTime(0.45, debut + 1.3);
	gain.gain.linearRampToValueAtTime(0, debut + 1.6);
	osc.start(debut);
	osc.stop(debut + 1.7);
};

const getMessage = (nb: number, total: number) => {
	const r = nb / total;
	if (r >= 1)    return "Score parfait ! Excellente discrimination !";
	if (r >= 0.75) return "Très bien ! Poursuivez vos efforts !";
	if (r >= 0.5)  return "Pas mal ! Continuez à vous entraîner.";
	return "Ne vous découragez pas, réessayez !";
};

const TOTAL = 6;
const tirerSon = (): TypeSon => Math.random() > 0.5 ? "saccade" : "continu";

const ReconnaitreRythmeExercice = ({ exercice }: Props) => {
	const navigate = useNavigate();
	const ctxRef = useRef<AudioContext | null>(null);

	const [ecran, setEcran]       = useState<Ecran>("preparation");
	const [sonActuel, setSon]     = useState<TypeSon>(tirerSon);
	const [reponse, setReponse]   = useState<TypeSon | null>(null);
	const [feedback, setFeedback] = useState<"ok" | "ko" | null>(null);
	const [question, setQuestion] = useState(1);
	const [score, setScore]       = useState(0);
	const [jouant, setJouant]     = useState(false);
	const [aEcoute, setAEcoute]   = useState(false);

	const getCtxResume = async () => {
		const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
		await ctx.resume();
		ctxRef.current = ctx;
		return ctx;
	};

	const jouer = useCallback(async (type: TypeSon) => {
		if (jouant) return;
		setJouant(true);
		const ctx = await getCtxResume();
		if (type === "saccade") jouerSonSaccade(ctx);
		else jouerSonContinu(ctx);
		const duree = type === "saccade" ? 1300 : 1900;
		setTimeout(() => {
			setJouant(false);
			setAEcoute(true);
		}, duree);
	}, [jouant]);

	/* Lecture auto à chaque nouvelle question */
	useEffect(() => {
		if (ecran !== "exercice") return;
		const t = setTimeout(() => jouer(sonActuel), 500);
		return () => clearTimeout(t);
	}, [question, ecran]);

	const valider = () => {
		if (!reponse || feedback || !aEcoute) return;
		const correct = reponse === sonActuel;
		if (correct) setScore(s => s + 1);
		setFeedback(correct ? "ok" : "ko");
	};

	const suivant = async () => {
		if (question >= TOTAL) {
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
			const next = tirerSon();
			setSon(next);
			setReponse(null);
			setFeedback(null);
			setAEcoute(false);
			setQuestion(q => q + 1);
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
						<circle cx="60" cy="60" r="50" fill="none" stroke="#0D9488" strokeWidth="10"
							strokeLinecap="round"
							strokeDasharray={2 * Math.PI * 50}
							strokeDashoffset={2 * Math.PI * 50 * (1 - pct / 100)}
							transform="rotate(-90 60 60)" />
						<text x="60" y="55" textAnchor="middle" fontSize="20" fontWeight="800" fill="#0F172A">{pct}%</text>
						<text x="60" y="75" textAnchor="middle" fontSize="11" fill="#64748B">Score</text>
					</svg>
				</div>
				<p className="det-result-message">{getMessage(score, TOTAL)}</p>
				<div className="det-result-actions">
					<button type="button" className="det-btn-outline" onClick={() => navigate(-1)}>Retour aux exercices</button>
					<button type="button" className="det-btn-noir" onClick={() => navigate("/dashboard")}>Continuer</button>
				</div>
			</div>
		);
	}

	/* ── Préparation ── */
	if (ecran === "preparation") {
		return (
			<div className="rythme-page">
				<div className="ep-topbar">
					<button type="button" className="ep-close" onClick={() => navigate(-1)} aria-label="Fermer">
						<X size={18} strokeWidth={2.5} />
					</button>
				</div>

				<div className="rythme-config-content">
					<h1 className="rythme-titre">Reconnaître le rythme</h1>
					<p className="rythme-description">
						Écoutez les deux sons pour vous familiariser, puis commencez.
					</p>

					<div className="rythme-prepa-sons">
						<div className="rythme-prepa-son">
							<button type="button" className="rythme-play-sm" onClick={async () => {
								const ctx = await getCtxResume();
								jouerSonSaccade(ctx);
							}} aria-label="Écouter le son saccadé">
								<span aria-hidden="true">▶</span>
							</button>
							<p className="rythme-prepa-label">Son saccadé</p>
						</div>
						<div className="rythme-prepa-son">
							<button type="button" className="rythme-play-sm" onClick={async () => {
								const ctx = await getCtxResume();
								jouerSonContinu(ctx);
							}} aria-label="Écouter le son continu">
								<span aria-hidden="true">▶</span>
							</button>
							<p className="rythme-prepa-label">Son continu</p>
						</div>
					</div>
				</div>

				<div className="rythme-footer">
					<button type="button" className="rythme-btn-noir"
						onClick={() => { setSon(tirerSon()); setEcran("exercice"); }}>
						C'est parti !
					</button>
				</div>
			</div>
		);
	}

	/* ── Exercice ── */
	return (
		<div className="rythme-page">
			<div className="ep-topbar">
				<button type="button" className="ep-close" onClick={() => navigate(-1)} aria-label="Fermer">
					<X size={18} strokeWidth={2.5} />
				</button>
				<div className="ep-progress" role="progressbar"
					aria-valuenow={question} aria-valuemin={1} aria-valuemax={TOTAL}
					aria-label={`Question ${question} sur ${TOTAL}`}>
					{Array.from({ length: TOTAL }).map((_, i) => (
						<div key={i} className={`ep-progress-dash${i < question - 1 ? " ep-progress-dash--actif" : i === question - 1 ? " ep-progress-dash--current" : ""}`} />
					))}
				</div>
				<span className="ep-progress-label">{question} / {TOTAL}</span>
			</div>

			<p className="rythme-instruction">SACCADÉ OU CONTINU ?</p>

			<div className="rythme-play-area">
				<button type="button" className="rythme-big-play"
					onClick={() => jouer(sonActuel)}
					disabled={jouant}
					aria-label="Écouter le son">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
						<polygon points="5,3 19,12 5,21" />
					</svg>
				</button>
				<p className="rythme-play-hint">
					{jouant ? "Écoute en cours…" : aEcoute ? "Appuyer pour réécouter" : "Écoute en cours…"}
				</p>
			</div>

			<div className="rythme-reponses rythme-reponses--row" role="group" aria-label="Choisissez une réponse">
				{(["saccade", "continu"] as TypeSon[]).map((option) => {
					let cls = "rythme-reponse-card";
					if (feedback) {
						if (option === sonActuel)    cls += " rythme-reponse-card--correct";
						else if (option === reponse) cls += " rythme-reponse-card--incorrect";
					} else if (!aEcoute) {
						cls += " rythme-reponse-card--locked";
					} else if (reponse === option) {
						cls += " rythme-reponse-card--select";
					}
					return (
						<button key={option} type="button" className={cls}
							onClick={() => !feedback && aEcoute && setReponse(option)}
							disabled={!aEcoute || !!feedback}
							aria-pressed={reponse === option}>
							<div className="rythme-reponse-icone" aria-hidden="true">
								{option === "saccade" ? (
									<svg width="60" height="20" viewBox="0 0 60 20">
										<circle cx="10" cy="10" r="8" fill="currentColor" opacity="0.85" />
										<circle cx="30" cy="10" r="8" fill="currentColor" opacity="0.85" />
										<circle cx="50" cy="10" r="8" fill="currentColor" opacity="0.85" />
									</svg>
								) : (
									<svg width="62" height="28" viewBox="0 0 62 28">
										<path d="M1,14 Q13,1 25,14 Q37,27 49,14 Q55,7 61,14"
											stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
									</svg>
								)}
							</div>
							<div className="rythme-reponse-body">
								<p className="rythme-reponse-label">
									{option === "saccade" ? "Saccadé" : "Continu"}
								</p>
								<p className="rythme-reponse-sub">
									{option === "saccade" ? "Sons courts et répétés" : "Son long et régulier"}
								</p>
							</div>
						</button>
					);
				})}
			</div>

			{feedback ? (
				<div className={`ep-footer-feedback ${feedback === "ok" ? "ep-footer-feedback--ok" : "ep-footer-feedback--ko"}`}>
					<p className="ep-footer-feedback-label">
						{feedback === "ok" ? "Bonne réponse !" : `C'était : son ${sonActuel}`}
					</p>
					<button type="button" className="ep-btn-suivant-inline" onClick={suivant}>
						{question >= TOTAL ? "Voir mon score" : "Continuer"}
						<ChevronRight size={18} strokeWidth={2.5} />
					</button>
				</div>
			) : (
				<div className="rythme-footer">
					<button type="button"
						className={`rythme-btn-gris${reponse && aEcoute ? " rythme-btn-gris--actif" : ""}`}
						onClick={valider}
						disabled={!reponse || !aEcoute}>
						Valider
					</button>
				</div>
			)}
		</div>
	);
};

export default ReconnaitreRythmeExercice;
