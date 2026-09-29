import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, Play, Pause, Clock } from "lucide-react";
import { demarrerBruitFond, niveauBruitParDefaut } from "../utils/bruitFond";
import { NIVEAU_LABEL } from "../utils/niveau";
import { enregistrerResultat } from "../utils/resultats";
import ResultScreen from "./ResultScreen";

interface Props {
	exercice: {
		id: number;
		titre: string;
		niveau: string;
	};
}

/* Facile : sons espacés, fenêtre large, silence — Difficile : rythme dense, fenêtre courte, bruit de fond */
const PARAMETRES_PAR_NIVEAU: Record<string, { duree: number; nbSonsMin: number; nbSonsMax: number; tolerance: number }> = {
	facile:     { duree: 14, nbSonsMin: 3, nbSonsMax: 5, tolerance: 1800 },
	moyen:      { duree: 12, nbSonsMin: 4, nbSonsMax: 6, tolerance: 1300 },
	difficile:  { duree: 10, nbSonsMin: 5, nbSonsMax: 8, tolerance: 900 },
};

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
const calculerBonnesReponses = (sons: number[], clics: number[], tolerance: number): number => {
	const usedClics = new Set<number>();
	let bonnes = 0;
	for (const son of sons) {
		for (let i = 0; i < clics.length; i++) {
			if (!usedClics.has(i)) {
				const delta = clics[i] - son;
				if (delta >= -300 && delta <= tolerance) {
					bonnes++;
					usedClics.add(i);
					break;
				}
			}
		}
	}
	return bonnes;
};



const DetecterExercice = ({ exercice }: Props) => {
	const navigate = useNavigate();
	const params = PARAMETRES_PAR_NIVEAU[exercice.niveau] || PARAMETRES_PAR_NIVEAU.facile;
	const audioCtxRef   = useRef<AudioContext | null>(null);
	const bruitCtrlRef  = useRef<{ stop: () => void } | null>(null);
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
		bruitCtrlRef.current = demarrerBruitFond(ctx, niveauBruitParDefaut(exercice.niveau));
		soundTimes.current  = [];
		clickTimes.current  = [];

		jouerBip(ctx);

		const nbSons = Math.floor(Math.random() * (params.nbSonsMax - params.nbSonsMin + 1)) + params.nbSonsMin;
		const timestamps: number[] = [];
		for (let i = 0; i < nbSons; i++) {
			timestamps.push(Math.random() * (params.duree * 1000 - 2500) + 1500);
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
			setProgression((p) => Math.min(p + 100 / (params.duree * 10), 100));
		}, 100);

		const timerFin = setTimeout(async () => {
			clearInterval(intervalProg);
			setProgression(100);
			bruitCtrlRef.current?.stop();
			bruitCtrlRef.current = null;

			const bonnesR = calculerBonnesReponses(soundTimes.current, clickTimes.current, params.tolerance);
			setBonnes(bonnesR);
			setTotal(soundTimes.current.length);
			setStatut("termine");

			const score = soundTimes.current.length > 0
				? Math.round((bonnesR / soundTimes.current.length) * 100)
				: 0;
			await enregistrerResultat(exercice.id, score);
		}, params.duree * 1000);

		timersRef.current = [
			...timersBips,
			timerFin,
			intervalProg as unknown as ReturnType<typeof setTimeout>,
		];
	}, [exercice.id, exercice.niveau, params.duree, params.nbSonsMin, params.nbSonsMax, params.tolerance]);

	const detecter = () => {
		if (statut !== "en_cours") return;
		const now = Date.now();
		clickTimes.current.push(now);

		/* Feedback si clic proche d'un son */
		const bonClic = soundTimes.current.some(
			(t) => now >= t - 300 && now <= t + params.tolerance,
		);
		if (bonClic) {
			setFeedback(true);
			if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
			feedbackTimer.current = setTimeout(() => setFeedback(false), 900);
		}
	};

	const fermer = () => {
		timersRef.current.forEach(clearTimeout);
		bruitCtrlRef.current?.stop();
		audioCtxRef.current?.close();
		navigate(-1);
	};

	/* ── Écran résultats ── */
	if (ecran === "resultats") {
		const pct = total > 0 ? Math.round((bonnes / total) * 100) : 0;
		return <ResultScreen score={pct} bonnes={bonnes} total={total} />;
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

				<span className={`badge badge--${exercice.niveau}`}>{NIVEAU_LABEL[exercice.niveau]}</span>

				<div className="det-timer" aria-hidden="true">
					<Clock size={18} strokeWidth={1.8} />
				</div>
			</div>

			<p style={{ textAlign: "center", fontWeight: 700, marginTop: "0.75rem" }}>{exercice.titre}</p>

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
