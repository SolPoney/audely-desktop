import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronRight } from "lucide-react";
import { API_URL } from "../config/api";
import { getUserId } from "../hooks/useAuth";

interface Props {
	exercice: { id: number; titre: string; niveau: string };
}

type Ecran = "config" | "preparation" | "exercice" | "resultats";
type TypeVoix = "homme" | "toutes" | "femme";
type TypeSon = "saccade" | "continu";

const getCtx = () =>
	new (window.AudioContext || (window as any).webkitAudioContext)();

const jouerSonSaccade = (ctx: AudioContext) => {
	for (let i = 0; i < 5; i++) {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.type = "sine";
		osc.frequency.value = 660;
		const debut = ctx.currentTime + 0.1 + i * 0.22;
		gain.gain.setValueAtTime(0.5, debut);
		gain.gain.setValueAtTime(0, debut + 0.09);
		osc.start(debut);
		osc.stop(debut + 0.1);
	}
};

const jouerSonContinu = (ctx: AudioContext) => {
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.type = "sine";
	osc.frequency.value = 440;
	const debut = ctx.currentTime + 0.1;
	gain.gain.setValueAtTime(0, debut);
	gain.gain.linearRampToValueAtTime(0.5, debut + 0.15);
	gain.gain.setValueAtTime(0.5, debut + 1.3);
	gain.gain.linearRampToValueAtTime(0, debut + 1.6);
	osc.start(debut);
	osc.stop(debut + 1.7);
};

const jouerSon = (ctx: AudioContext, type: TypeSon) => {
	if (type === "saccade") jouerSonSaccade(ctx);
	else jouerSonContinu(ctx);
};

const getMessage = (nb: number, total: number) => {
	const r = nb / total;
	if (r >= 1)    return "Score parfait ! Excellente discrimination !";
	if (r >= 0.75) return "Très bien ! Poursuivez vos efforts !";
	if (r >= 0.5)  return "Pas mal ! Continuez à vous entraîner.";
	return "Ne vous découragez pas, réessayez !";
};

const ReconnaitreRythmeExercice = ({ exercice }: Props) => {
	const navigate = useNavigate();
	const [ecran, setEcran] = useState<Ecran>("config");
	const [typeVoix, setTypeVoix] = useState<TypeVoix>("toutes");
	const [sonADeviner, setSonADeviner] = useState<TypeSon>("saccade");
	const [reponse, setReponse] = useState<TypeSon | null>(null);
	const [feedback, setFeedback] = useState<"ok" | "ko" | null>(null);
	const [question, setQuestion] = useState(1);
	const [score, setScore] = useState(0);
	const TOTAL = 5;
	const audioCtxRef = useRef<AudioContext | null>(null);

	const getCtxResume = async () => {
		const ctx = getCtx();
		await ctx.resume();
		audioCtxRef.current = ctx;
		return ctx;
	};

	const demarrerPreparation = async () => {
		await getCtxResume();
		setEcran("preparation");
	};

	const tirerSon = (): TypeSon => Math.random() > 0.5 ? "saccade" : "continu";

	const demarrerExercice = () => {
		setSonADeviner(tirerSon());
		setReponse(null);
		setFeedback(null);
		setEcran("exercice");
	};

	const jouerSonPrepa = async (type: TypeSon) => {
		const ctx = await getCtxResume();
		jouerSon(ctx, type);
	};

	const jouerSonExercice = async () => {
		const ctx = await getCtxResume();
		jouerSon(ctx, sonADeviner);
	};

	const valider = () => {
		if (!reponse || feedback) return;
		const correct = reponse === sonADeviner;
		if (correct) setScore(s => s + 1);
		setFeedback(correct ? "ok" : "ko");
	};

	const suivant = async () => {
		if (question >= TOTAL) {
			const finalScore = score + (feedback === "ok" ? 1 : 0);
			const token = localStorage.getItem("token");
			await fetch(`${API_URL}/api/resultats`, {
				method: "POST",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
				body: JSON.stringify({
					id_utilisateur: getUserId(),
					id_exercice: exercice.id,
					score: Math.round((finalScore / TOTAL) * 100),
				}),
			});
			setScore(finalScore);
			setEcran("resultats");
		} else {
			setQuestion(q => q + 1);
			setSonADeviner(tirerSon());
			setReponse(null);
			setFeedback(null);
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
						<text x="60" y="55" textAnchor="middle" fontSize="20" fontWeight="800" fill="#0F172A">
							{pct}%
						</text>
						<text x="60" y="75" textAnchor="middle" fontSize="11" fill="#64748B">Score</text>
					</svg>
				</div>
				<p className="det-result-message">{getMessage(score, TOTAL)}</p>
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

	/* ── Config ── */
	if (ecran === "config") {
		return (
			<div className="rythme-page">
				<button className="detecter-close" onClick={() => navigate("/dashboard")} aria-label="Fermer">
					<X size={16} />
				</button>
				<div className="rythme-config-content">
					<h1 className="rythme-titre">{exercice.titre}</h1>
					<p className="rythme-sous-titre">Exercice</p>
					<p className="rythme-description">{exercice.titre} — entraînez-vous à reconnaître le rythme.</p>
					<div className="rythme-voix-selector" role="group" aria-label="Filtre de voix">
						{(["homme", "toutes", "femme"] as TypeVoix[]).map((v) => (
							<button
								key={v}
								type="button"
								className={`rythme-voix-btn${typeVoix === v ? " rythme-voix-btn--actif" : ""}`}
								onClick={() => setTypeVoix(v)}
								aria-pressed={typeVoix === v}
							>
								<span aria-hidden="true" style={{ fontSize: "1.5rem" }}>{v === "homme" ? "🚹" : v === "toutes" ? "🚻" : "🚺"}</span>
								<span style={{ whiteSpace: "pre-line" }}>{v === "homme" ? "Voix\nd'homme" : v === "toutes" ? "Toutes\nles voix" : "Voix\nde femme"}</span>
							</button>
						))}
					</div>
				</div>
				<div className="rythme-footer">
					<button type="button" className="rythme-btn-noir" onClick={demarrerPreparation}>
						Commencer l'exercice
					</button>
				</div>
			</div>
		);
	}

	/* ── Préparation ── */
	if (ecran === "preparation") {
		return (
			<div className="rythme-page">
				<button className="detecter-close" onClick={() => navigate("/dashboard")} aria-label="Fermer">
					<X size={16} />
				</button>
				<div className="rythme-config-content">
					<h2 className="rythme-titre rythme-titre--sm">
						Écoutez ces sons pour vous préparer.
					</h2>
					<div className="rythme-prepa-sons">
						<div className="rythme-prepa-son">
							<button type="button" className="rythme-play-sm" onClick={() => jouerSonPrepa("saccade")} aria-label="Écouter le son saccadé">
								<span aria-hidden="true">▶</span>
							</button>
							<p className="rythme-prepa-label">Son saccadé</p>
						</div>
						<div className="rythme-prepa-son">
							<button type="button" className="rythme-play-sm" onClick={() => jouerSonPrepa("continu")} aria-label="Écouter le son continu">
								<span aria-hidden="true">▶</span>
							</button>
							<p className="rythme-prepa-label">Son continu</p>
						</div>
					</div>
				</div>
				<div className="rythme-footer">
					<button type="button" className="rythme-btn-noir" onClick={demarrerExercice}>
						Continuer
					</button>
				</div>
			</div>
		);
	}

	/* ── Exercice ── */
	return (
		<div className="rythme-page">
			<div className="ep-topbar">
				<button className="ep-close" onClick={() => navigate("/dashboard")} aria-label="Fermer">
					<X size={18} strokeWidth={2.5} />
				</button>
				<div
					className="ep-progress"
					role="progressbar"
					aria-valuenow={question}
					aria-valuemin={1}
					aria-valuemax={TOTAL}
					aria-label={`Question ${question} sur ${TOTAL}`}
				>
					{Array.from({ length: TOTAL }).map((_, i) => (
						<div key={i} className={`ep-progress-dash${i < question - 1 ? " ep-progress-dash--actif" : i === question - 1 ? " ep-progress-dash--current" : ""}`} />
					))}
				</div>
				<span className="ep-progress-label">{question} / {TOTAL}</span>
			</div>

			<p className="rythme-instruction">QUEL EST LE RYTHME ?</p>

			<div className="rythme-play-area">
				<button type="button" className="rythme-big-play" onClick={jouerSonExercice} aria-label="Écouter le son">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
						<polygon points="5,3 19,12 5,21" />
					</svg>
				</button>
				<p className="rythme-play-hint">Appuyer pour écouter</p>
			</div>

			<div className="rythme-reponses" role="group" aria-label="Choisissez une réponse">
				<button
					type="button"
					className={`rythme-reponse-card${reponse === "saccade" ? " rythme-reponse-card--select" : ""}${feedback && reponse === "saccade" ? (feedback === "ok" ? " rythme-reponse-card--correct" : " rythme-reponse-card--incorrect") : ""}${feedback && reponse !== "saccade" && sonADeviner === "saccade" ? " rythme-reponse-card--correct" : ""}`}
					onClick={() => !feedback && setReponse("saccade")}
					disabled={!!feedback}
					aria-pressed={reponse === "saccade"}
				>
					<div className="rythme-reponse-icone" aria-hidden="true">
						<svg width="60" height="28" viewBox="0 0 60 28">
							<circle cx="10" cy="14" r="7" fill={reponse === "saccade" ? "#0D9488" : "#CBD5E1"} />
							<circle cx="30" cy="14" r="7" fill={reponse === "saccade" ? "#0D9488" : "#CBD5E1"} />
							<circle cx="50" cy="14" r="7" fill={reponse === "saccade" ? "#0D9488" : "#CBD5E1"} />
						</svg>
					</div>
					<div className="rythme-reponse-body">
						<p className="rythme-reponse-label">Son saccadé</p>
						<p className="rythme-reponse-sub">Discontinu, haché</p>
					</div>
				</button>

				<button
					type="button"
					className={`rythme-reponse-card${reponse === "continu" ? " rythme-reponse-card--select" : ""}${feedback && reponse === "continu" ? (feedback === "ok" ? " rythme-reponse-card--correct" : " rythme-reponse-card--incorrect") : ""}${feedback && reponse !== "continu" && sonADeviner === "continu" ? " rythme-reponse-card--correct" : ""}`}
					onClick={() => !feedback && setReponse("continu")}
					disabled={!!feedback}
					aria-pressed={reponse === "continu"}
				>
					<div className="rythme-reponse-icone" aria-hidden="true">
						<svg width="72" height="28" viewBox="0 0 72 28">
							<path
								d="M4,14 Q12,4 20,14 Q28,24 36,14 Q44,4 52,14 Q60,24 68,14"
								stroke={reponse === "continu" ? "#0D9488" : "#CBD5E1"}
								strokeWidth="3.5"
								fill="none"
								strokeLinecap="round"
							/>
						</svg>
					</div>
					<div className="rythme-reponse-body">
						<p className="rythme-reponse-label">Son continu</p>
						<p className="rythme-reponse-sub">Fluide, sans rupture</p>
					</div>
				</button>
			</div>

			{feedback ? (
				<div className={`ep-footer-feedback ${feedback === "ok" ? "ep-footer-feedback--ok" : "ep-footer-feedback--ko"}`}>
					<p className="ep-footer-feedback-label">
						{feedback === "ok" ? "Bonne réponse !" : `C'était : son ${sonADeviner}`}
					</p>
					<button type="button" className="ep-btn-suivant-inline" onClick={suivant}>
						{question >= TOTAL ? "Voir mon score" : "Continuer"}
						<ChevronRight size={18} strokeWidth={2.5} />
					</button>
				</div>
			) : (
				<div className="rythme-footer">
					<button
						type="button"
						className={`rythme-btn-gris${reponse ? " rythme-btn-gris--actif" : ""}`}
						onClick={valider}
						disabled={!reponse}
					>
						Valider
					</button>
				</div>
			)}
		</div>
	);
};

export default ReconnaitreRythmeExercice;
