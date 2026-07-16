import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import { getUserId } from "../hooks/useAuth";
import { X, Play, Pause, Clock } from "lucide-react";
import ResultScreen from "./ResultScreen";

interface Props {
	exercice: {
		id: number;
		titre: string;
		niveau: string;
	};
}

const DUREE_SECONDES = 12;
const NB_SONS_MIN = 3;
const NB_SONS_MAX = 6;
const TOLERANCE_MS = 1500; // fenêtre de détection correcte

/* Bip audio pur */
const jouerBip = (ctx: AudioContext) => {
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.type = "sine";
	osc.frequency.value = 880;
	gain.gain.value = 0.45;
	osc.start(ctx.currentTime);
	osc.stop(ctx.currentTime + 0.28);
};

/* Calcule les bonnes réponses : chaque son matché à un clic dans la fenêtre */
const calculerBonnesReponses = (sons: number[], clics: number[]): number => {
	const usedClics = new Set<number>();
	let bonnes = 0;
	for (const son of sons) {
		for (let i = 0; i < clics.length; i++) {
			if (!usedClics.has(i)) {
				const delta = clics[i] - son;
				if (delta >= -300 && delta <= TOLERANCE_MS) {
					bonnes++;
					usedClics.add(i);
					break;
				}
			}
		}
	}
	return bonnes;
};

const getMessage = (bonnes: number, total: number): string => {
	if (total === 0) return "Exercice terminé !";
	const ratio = bonnes / total;
	if (ratio >= 1) return "Score parfait ! Excellent travail.";
	if (ratio >= 0.75) return "Très bien ! Poursuivez vos efforts !";
	if (ratio >= 0.5) return "Pas mal ! Continuez à vous entraîner.";
	return "Ne vous découragez pas, réessayez !";
};

/* ── Illustration SVG ── */
const IllustrationEcoute = () => (
	<svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
		{/* Fond cercle doux */}
		<circle cx="140" cy="110" r="95" fill="#F0FDFA" />

		{/* Corps */}
		<ellipse cx="140" cy="178" rx="42" ry="24" fill="#E2E8F0" />
		<rect x="118" y="148" width="44" height="38" rx="10" fill="#CBD5E1" />

		{/* Tête */}
		<circle cx="140" cy="108" r="36" fill="#FFD5A8" />

		{/* Bandeau casque */}
		<path d="M104 100 Q140 68 176 100" stroke="#1E293B" strokeWidth="6" fill="none" strokeLinecap="round" />

		{/* Oreillettes */}
		<rect x="96" y="97" width="17" height="24" rx="8.5" fill="#0D9488" />
		<rect x="167" y="97" width="17" height="24" rx="8.5" fill="#0D9488" />

		{/* Yeux */}
		<ellipse cx="130" cy="108" rx="4.5" ry="5" fill="#1E293B" />
		<ellipse cx="150" cy="108" rx="4.5" ry="5" fill="#1E293B" />
		<circle cx="131.5" cy="106.5" r="1.5" fill="white" />
		<circle cx="151.5" cy="106.5" r="1.5" fill="white" />

		{/* Sourire */}
		<path d="M129 122 Q140 133 151 122" stroke="#1E293B" strokeWidth="3" fill="none" strokeLinecap="round" />

		{/* Ondes sonores droite */}
		<path d="M194 93 Q206 110 194 127" stroke="#0D9488" strokeWidth="3.5" fill="none" strokeLinecap="round" />
		<path d="M205 84 Q222 110 205 136" stroke="#0D9488" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.55" />
		<path d="M216 76 Q238 110 216 144" stroke="#0D9488" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.25" />

		{/* Ondes sonores gauche */}
		<path d="M86 93 Q74 110 86 127" stroke="#0D9488" strokeWidth="3.5" fill="none" strokeLinecap="round" />
		<path d="M75 84 Q58 110 75 136" stroke="#0D9488" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.55" />
	</svg>
);

const DetecterExercice = ({ exercice }: Props) => {
	const navigate = useNavigate();
	const audioCtxRef   = useRef<AudioContext | null>(null);
	const timersRef     = useRef<ReturnType<typeof setTimeout>[]>([]);
	const soundTimes    = useRef<number[]>([]);
	const clickTimes    = useRef<number[]>([]);
	const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [ecran, setEcran]           = useState<"exercice" | "resultats">("exercice");
	const [statut, setStatut]         = useState<"attente" | "en_cours" | "termine">("attente");
	const [progression, setProgression] = useState(0);
	const [feedback, setFeedback]     = useState<boolean>(false);
	const [bonnes, setBonnes]         = useState(0);
	const [total, setTotal]           = useState(0);

	/* Arc de progression SVG */
	const RING_R = 76;
	const CIRCUMFERENCE = 2 * Math.PI * RING_R;
	const offset = CIRCUMFERENCE * (1 - progression / 100);

	const demarrer = useCallback(async () => {
		const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
		await ctx.resume();
		audioCtxRef.current = ctx;
		soundTimes.current  = [];
		clickTimes.current  = [];

		jouerBip(ctx);

		const nbSons = Math.floor(Math.random() * (NB_SONS_MAX - NB_SONS_MIN + 1)) + NB_SONS_MIN;
		const timestamps: number[] = [];
		for (let i = 0; i < nbSons; i++) {
			timestamps.push(Math.random() * (DUREE_SECONDES * 1000 - 2500) + 1500);
		}
		timestamps.sort((a, b) => a - b);

		setStatut("en_cours");
		setProgression(0);

		const timersBips = timestamps.map((t) =>
			setTimeout(() => {
				if (audioCtxRef.current) {
					jouerBip(audioCtxRef.current);
					soundTimes.current.push(Date.now());
				}
			}, t),
		);

		const intervalProg = setInterval(() => {
			setProgression((p) => Math.min(p + 100 / (DUREE_SECONDES * 10), 100));
		}, 100);

		const timerFin = setTimeout(async () => {
			clearInterval(intervalProg);
			setProgression(100);

			const bonnesR = calculerBonnesReponses(soundTimes.current, clickTimes.current);
			setBonnes(bonnesR);
			setTotal(soundTimes.current.length);
			setStatut("termine");

			const token = localStorage.getItem("token");
			await fetch(`${API_URL}/api/resultats`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					id_utilisateur: getUserId(),
					id_exercice: exercice.id,
					score: bonnesR,
				}),
			});
		}, DUREE_SECONDES * 1000);

		timersRef.current = [
			...timersBips,
			timerFin,
			intervalProg as unknown as ReturnType<typeof setTimeout>,
		];
	}, [exercice.id]);

	const detecter = () => {
		if (statut !== "en_cours") return;
		const now = Date.now();
		clickTimes.current.push(now);

		/* Feedback si clic proche d'un son */
		const bonClic = soundTimes.current.some(
			(t) => now >= t - 300 && now <= t + TOLERANCE_MS,
		);
		if (bonClic) {
			setFeedback(true);
			if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
			feedbackTimer.current = setTimeout(() => setFeedback(false), 900);
		}
	};

	const fermer = () => {
		timersRef.current.forEach(clearTimeout);
		audioCtxRef.current?.close();
		navigate(-1);
	};

	/* ── Écran résultats ── */
	if (ecran === "resultats") {
		return (
			<div className="det-result">
				<h1 className="det-result-score">
					Vous avez {bonnes}/{total} bonne{bonnes > 1 ? "s" : ""} réponse{bonnes > 1 ? "s" : ""}.
				</h1>
				<div className="det-result-illus">
					<IllustrationEcoute />
				</div>
				<p className="det-result-message">{getMessage(bonnes, total)}</p>
				<div className="det-result-actions">
					<button type="button" className="det-btn-outline" onClick={() => navigate(-1)}>
						Retour aux exercices
					</button>
					<button type="button" className="det-btn-noir" onClick={() => navigate("/dashboard")}>
						Continuer
					</button>
				</div>
			</div>
		);
	}

	/* ── Écran exercice ── */
	return (
		<div className="det-page">
			{/* Topbar */}
			<div className="det-topbar">
				<button
					type="button"
					className="det-close"
					onClick={fermer}
					aria-label="Fermer l'exercice"
				>
					<X size={18} strokeWidth={2.5} />
				</button>

				<div className="det-timer" aria-hidden="true">
					<Clock size={18} strokeWidth={1.8} />
				</div>
			</div>

			{/* Instruction */}
			<p className="det-instruction">
				{statut === "attente" && "Appuyez sur ▶ puis cliquez sur le bouton en bas de votre écran à chaque fois que vous entendez un son"}
				{statut === "en_cours" && "Écoutez cet enregistrement et cliquez sur le bouton en bas de votre écran à chaque fois que vous entendez un son"}
				{statut === "termine" && `Exercice terminé — ${bonnes} bonne${bonnes > 1 ? "s" : ""} détection${bonnes > 1 ? "s" : ""} sur ${total} son${total > 1 ? "s" : ""}`}
			</p>

			{/* Zone bouton central + ring SVG */}
			<div className="det-play-area">
				<div className="det-play-wrap">
					<svg
						className="det-ring-svg"
						viewBox="0 0 200 200"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						{/* Piste grise */}
						<circle cx="100" cy="100" r={RING_R} fill="none" stroke="#E2E8F0" strokeWidth="9" />
						{/* Arc teal de progression */}
						{statut === "en_cours" && (
							<circle
								cx="100" cy="100" r={RING_R}
								fill="none"
								stroke="#0D9488"
								strokeWidth="9"
								strokeLinecap="round"
								strokeDasharray={CIRCUMFERENCE}
								strokeDashoffset={offset}
								transform="rotate(-90 100 100)"
								style={{ transition: "stroke-dashoffset 0.1s linear" }}
							/>
						)}
					</svg>

					<button
						type="button"
						className={`det-play-btn${statut === "en_cours" ? " det-play-btn--playing" : ""}${statut === "termine" ? " det-play-btn--done" : ""}`}
						onClick={statut === "attente" ? demarrer : statut === "termine" ? () => setEcran("resultats") : undefined}
						disabled={statut === "en_cours"}
						aria-label={
							statut === "attente" ? "Démarrer l'exercice" :
							statut === "en_cours" ? "Exercice en cours" :
							"Voir les résultats"
						}
					>
						{statut === "attente" && <Play size={44} color="white" strokeWidth={1.8} style={{ marginLeft: 6 }} />}
						{statut === "en_cours" && <Pause size={40} color="white" strokeWidth={1.8} />}
						{statut === "termine" && (
							<span style={{ fontSize: "2.5rem", lineHeight: 1 }}>✓</span>
						)}
					</button>
				</div>
			</div>

			{/* Footer */}
			<div className="det-footer">
				{feedback && (
					<div className="det-feedback-bar" aria-live="polite">
						Bonne réponse
					</div>
				)}
				<button
					type="button"
					className="det-btn-son"
					onClick={statut === "termine" ? () => setEcran("resultats") : detecter}
					disabled={statut === "attente"}
					aria-label={statut === "termine" ? "Voir les résultats" : "J'entends un son"}
				>
					{statut === "termine" ? "Voir les résultats →" : "J'entends un son !"}
				</button>
			</div>
		</div>
	);
};

export default DetecterExercice;
