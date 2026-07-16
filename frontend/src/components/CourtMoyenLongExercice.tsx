import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronRight } from "lucide-react";
import { API_URL } from "../config/api";
import { getUserId } from "../hooks/useAuth";

interface Props {
	exercice: { id: number; titre: string; niveau: string };
}

type Ecran = "config" | "exercice" | "resultats";
type TypeVoix = "homme" | "toutes" | "femme";
type Duree = "court" | "moyen" | "long";

const TOTAL = 5;

const DUREES_MS: Record<Duree, number> = { court: 0.25, moyen: 0.7, long: 1.4 };

const getCtx = () => new (window.AudioContext || (window as any).webkitAudioContext)();

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

const getMessage = (nb: number) => {
	const r = nb / TOTAL;
	if (r >= 1)    return "Score parfait ! Excellente discrimination !";
	if (r >= 0.75) return "Très bien ! Poursuivez vos efforts !";
	if (r >= 0.5)  return "Pas mal ! Continuez à vous entraîner.";
	return "Ne vous découragez pas, réessayez !";
};

const CourtMoyenLongExercice = ({ exercice }: Props) => {
	const navigate = useNavigate();
	const [ecran, setEcran]                 = useState<Ecran>("config");
	const [typeVoix, setTypeVoix]           = useState<TypeVoix>("toutes");
	const [questionNum, setQuestionNum]     = useState(1);
	const [dureeActuelle, setDureeActuelle] = useState<Duree>(tirerDuree);
	const [reponse, setReponse]             = useState<Duree | null>(null);
	const [feedback, setFeedback]           = useState<"ok" | "ko" | null>(null);
	const [score, setScore]                 = useState(0);
	const [sonJoue, setSonJoue]             = useState(false);
	const ctxRef = useRef<AudioContext | null>(null);

	const jouer = async () => {
		const ctx = getCtx();
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
				<p className="det-result-message">{getMessage(score)}</p>
				<div className="det-result-actions">
					<button className="det-btn-outline" onClick={() => navigate(-1)}>Retour aux exercices</button>
					<button className="det-btn-noir" onClick={() => navigate("/dashboard")}>Continuer</button>
				</div>
			</div>
		);
	}

	/* ── Config ── */
	if (ecran === "config") {
		return (
			<div className="rythme-page">
				<button type="button" className="detecter-close" onClick={() => navigate("/dashboard")} aria-label="Fermer">
					<X size={16} />
				</button>
				<div className="rythme-config-content">
					<h1 className="rythme-titre">{exercice.titre}</h1>
					<p className="rythme-sous-titre">Exercice</p>
					<p className="rythme-description">Écoutez le son et indiquez s'il est court, moyen ou long.</p>
					<div className="rythme-voix-selector" role="group">
						{(["homme", "toutes", "femme"] as TypeVoix[]).map((v) => (
							<button key={v} type="button"
								className={`rythme-voix-btn${typeVoix === v ? " rythme-voix-btn--actif" : ""}`}
								onClick={() => setTypeVoix(v)} aria-pressed={typeVoix === v}
							>
								<span aria-hidden="true" style={{ fontSize: "1.4rem" }}>{v === "homme" ? "🚹" : v === "toutes" ? "🚻" : "🚺"}</span>
								<span style={{ whiteSpace: "pre-line" }}>{v === "homme" ? "Voix\nd'homme" : v === "toutes" ? "Toutes\nles voix" : "Voix\nde femme"}</span>
							</button>
						))}
					</div>
				</div>
				<div className="rythme-footer">
					<button type="button" className="rythme-btn-noir" onClick={() => setEcran("exercice")}>
						Commencer l'exercice
					</button>
				</div>
			</div>
		);
	}

	/* ── Exercice ── */
	const DUREE_LABELS: Record<Duree, string> = { court: "Court", moyen: "Moyen", long: "Long" };

	return (
		<div className="rythme-page">
			<div className="ep-topbar">
				<button className="ep-close" onClick={() => navigate("/dashboard")} aria-label="Fermer">
					<X size={18} strokeWidth={2.5} />
				</button>
				<div className="ep-progress" role="progressbar" aria-valuenow={questionNum} aria-valuemin={1} aria-valuemax={TOTAL} aria-label={`Question ${questionNum} sur ${TOTAL}`}>
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

			<div className="rythme-reponses" role="group" aria-label="Choisissez une réponse">
				{(["court", "moyen", "long"] as Duree[]).map((d) => {
					let cls = "rythme-reponse-card";
					if (feedback) {
						if (d === dureeActuelle)    cls += " rythme-reponse-card--correct";
						else if (d === reponse)     cls += " rythme-reponse-card--incorrect";
						else                        cls += "";
					} else if (d === reponse) {
						cls += " rythme-reponse-card--select";
					}
					return (
						<button key={d} type="button" className={cls}
							onClick={() => !feedback && setReponse(d)}
							disabled={!!feedback}
							aria-pressed={reponse === d}
						>
							<div className="rythme-reponse-icone" aria-hidden="true">
								<div className="cml-barre-wrap">
									<div className={`cml-barre cml-barre--${d}`} />
								</div>
							</div>
							<div className="rythme-reponse-body">
								<p className="rythme-reponse-label">{DUREE_LABELS[d]}</p>
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
						className={`rythme-btn-gris${reponse ? " rythme-btn-gris--actif" : ""}`}
						onClick={valider} disabled={!reponse || !sonJoue}
					>
						Valider
					</button>
				</div>
			)}
		</div>
	);
};

export default CourtMoyenLongExercice;
