import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronRight } from "lucide-react";
import { enregistrerResultat } from "../utils/resultats";
import ResultScreen from "./ResultScreen";

interface Props {
	exercice: { id: number; titre: string; niveau: string };
}

type Duree = "court" | "moyen" | "long";

const TOTAL = 5;

const DUREES_MS: Record<Duree, number> = { court: 0.25, moyen: 0.7, long: 1.4 };
const DUREE_LABELS: Record<Duree, string> = { court: "Court", moyen: "Moyen", long: "Long" };
const DUREE_SUB: Record<Duree, string> = {
	court: "Son bref",
	moyen: "Durée intermédiaire",
	long: "Son étendu",
};

const jouerSon = (ctx: AudioContext, duree: number) => {
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.type = "sine";
	osc.frequency.value = 440;
	const t = ctx.currentTime + 0.05;
	gain.gain.setValueAtTime(0, t);
	gain.gain.linearRampToValueAtTime(0.45, t + 0.05);
	gain.gain.setValueAtTime(0.45, Math.max(t + 0.05, t + duree - 0.05));
	gain.gain.linearRampToValueAtTime(0, t + duree);
	osc.start(t);
	osc.stop(t + duree + 0.05);
};

const tirerDuree = (): Duree => {
	const options: Duree[] = ["court", "moyen", "long"];
	return options[Math.floor(Math.random() * options.length)];
};


const CourtMoyenLongExercice = ({ exercice }: Props) => {
	const navigate = useNavigate();
	const [ecran, setEcran]                 = useState<"exercice" | "resultats">("exercice");
	const [questionNum, setQuestionNum]     = useState(1);
	const [dureeActuelle, setDureeActuelle] = useState<Duree>(tirerDuree);
	const [reponse, setReponse]             = useState<Duree | null>(null);
	const [feedback, setFeedback]           = useState<"ok" | "ko" | null>(null);
	const [score, setScore]                 = useState(0);
	const [sonJoue, setSonJoue]             = useState(false);
	const ctxRef = useRef<AudioContext | null>(null);

	const jouer = async () => {
		const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
		await ctx.resume();
		ctxRef.current = ctx;
		jouerSon(ctx, DUREES_MS[dureeActuelle]);
		setSonJoue(true);
	};

	const valider = () => {
		if (!reponse || feedback) return;
		const correct = reponse === dureeActuelle;
		if (correct) setScore(s => s + 1);
		setFeedback(correct ? "ok" : "ko");
	};

	const suivant = async () => {
		if (questionNum >= TOTAL) {
			await enregistrerResultat(exercice.id, Math.round((score / TOTAL) * 100));
			setEcran("resultats");
		} else {
			setQuestionNum(n => n + 1);
			setDureeActuelle(tirerDuree());
			setReponse(null);
			setFeedback(null);
			setSonJoue(false);
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
				<button type="button" className="ep-close" onClick={() => navigate(-1)} aria-label="Fermer">
					<X size={18} strokeWidth={2.5} />
				</button>
				<div className="ep-progress" role="progressbar"
					aria-valuenow={questionNum} aria-valuemin={1} aria-valuemax={TOTAL}
					aria-label={`Question ${questionNum} sur ${TOTAL}`}>
					{Array.from({ length: TOTAL }).map((_, i) => (
						<div key={i} className={`ep-progress-dash${i < questionNum - 1 ? " ep-progress-dash--actif" : i === questionNum - 1 ? " ep-progress-dash--current" : ""}`} />
					))}
				</div>
				<span className="ep-progress-label">{questionNum} / {TOTAL}</span>
			</div>

			<p className="rythme-instruction">COURT, MOYEN OU LONG ?</p>

			<div className="rythme-play-area">
				<button type="button" className="rythme-big-play" onClick={jouer} aria-label="Écouter le son">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
						<polygon points="5,3 19,12 5,21" />
					</svg>
				</button>
				<p className="rythme-play-hint">{sonJoue ? "Appuyer pour réécouter" : "Appuyer pour écouter"}</p>
			</div>

			<div className="rythme-reponses rythme-reponses--compact" role="group" aria-label="Choisissez une réponse">
				{(["court", "moyen", "long"] as Duree[]).map((d) => {
					let cls = "rythme-reponse-card";
					if (feedback) {
						if (d === dureeActuelle)    cls += " rythme-reponse-card--correct";
						else if (d === reponse)     cls += " rythme-reponse-card--incorrect";
					} else if (!sonJoue) {
						cls += " rythme-reponse-card--locked";
					} else if (d === reponse) {
						cls += " rythme-reponse-card--select";
					}
					return (
						<button key={d} type="button" className={cls}
							onClick={() => !feedback && sonJoue && setReponse(d)}
							disabled={!sonJoue || !!feedback}
							aria-pressed={reponse === d}>
							<div className="rythme-reponse-icone" aria-hidden="true">
								{d === "court" && (
									<svg width="44" height="24" viewBox="0 0 44 24">
										<path d="M18,12 Q20,4 22,12 Q24,20 26,12"
											stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
									</svg>
								)}
								{d === "moyen" && (
									<svg width="44" height="24" viewBox="0 0 44 24">
										<path d="M8,12 Q13,2 18,12 Q23,22 28,12 Q33,2 38,12"
											stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
									</svg>
								)}
								{d === "long" && (
									<svg width="44" height="24" viewBox="0 0 44 24">
										<path d="M1,12 Q7,2 12,12 Q17,22 22,12 Q27,2 32,12 Q37,22 42,12 Q43,8 44,12"
											stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
									</svg>
								)}
							</div>
							<div className="rythme-reponse-body">
								<p className="rythme-reponse-label">{DUREE_LABELS[d]}</p>
								<p className="rythme-reponse-sub">{DUREE_SUB[d]}</p>
							</div>
						</button>
					);
				})}
			</div>

			{feedback ? (
				<div className={`ep-footer-feedback ${feedback === "ok" ? "ep-footer-feedback--ok" : "ep-footer-feedback--ko"}`}>
					<p className="ep-footer-feedback-label">
						{feedback === "ok" ? "Bonne réponse !" : `C'était : ${DUREE_LABELS[dureeActuelle]}`}
					</p>
					<button type="button" className="ep-btn-suivant-inline" onClick={suivant}>
						{questionNum >= TOTAL ? "Voir mon score" : "Continuer"}
						<ChevronRight size={18} strokeWidth={2.5} />
					</button>
				</div>
			) : (
				<div className="rythme-footer">
					<button type="button"
						className={`rythme-btn-gris${reponse && sonJoue ? " rythme-btn-gris--actif" : ""}`}
						onClick={valider}
						disabled={!reponse || !sonJoue}>
						Valider
					</button>
				</div>
			)}
		</div>
	);
};

export default CourtMoyenLongExercice;
