import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { X, Equal, Divide } from "lucide-react";
import { API_URL } from "../config/api";
import { getUserId } from "../hooks/useAuth";

interface Props {
	exercice: { id: number; titre: string; niveau: string };
}

type Ecran = "config" | "exercice";
type TypeVoix = "homme" | "toutes" | "femme";
type Reponse = "identique" | "different";

const TOTAL_QUESTIONS = 5;

/* ——— Génération audio ——— */
const getCtx = () =>
	new (window.AudioContext || (window as any).webkitAudioContext)();

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

/* Fréquences disponibles pour varier les sons */
const FREQUENCES = [330, 392, 440, 523, 587, 660, 784];

const tirerQuestion = (): { sonA: number; sonB: number; reponseCorrecte: Reponse } => {
	const freqA = FREQUENCES[Math.floor(Math.random() * FREQUENCES.length)];
	const identique = Math.random() > 0.5;
	if (identique) {
		return { sonA: freqA, sonB: freqA, reponseCorrecte: "identique" };
	}
	// Choisir une fréquence différente garantie
	let freqB = freqA;
	while (freqB === freqA) {
		freqB = FREQUENCES[Math.floor(Math.random() * FREQUENCES.length)];
	}
	return { sonA: freqA, sonB: freqB, reponseCorrecte: "different" };
};

const DistinguerExercice = ({ exercice }: Props) => {
	const navigate = useNavigate();
	const [ecran, setEcran] = useState<Ecran>("config");
	const [typeVoix, setTypeVoix] = useState<TypeVoix>("toutes");
	const [question, setQuestion] = useState(tirerQuestion());
	const [questionNum, setQuestionNum] = useState(1);
	const [reponse, setReponse] = useState<Reponse | null>(null);
	const [sonAJoue, setSonAJoue] = useState(false);
	const [sonBJoue, setSonBJoue] = useState(false);
	const scoresRef = useRef<boolean[]>([]);
	const ctxRef = useRef<AudioContext | null>(null);

	const getCtxResume = async () => {
		const ctx = getCtx();
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

	const valider = async () => {
		if (!reponse) return;
		scoresRef.current.push(reponse === question.reponseCorrecte);

		if (questionNum < TOTAL_QUESTIONS) {
			setQuestionNum((n) => n + 1);
			setQuestion(tirerQuestion());
			setReponse(null);
			setSonAJoue(false);
			setSonBJoue(false);
		} else {
			const nb = scoresRef.current.filter(Boolean).length;
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
					score: Math.round((nb / TOTAL_QUESTIONS) * 100),
				}),
			});
			if (nb === TOTAL_QUESTIONS) toast.success("Parfait !", { description: `${nb}/${TOTAL_QUESTIONS} bonnes réponses !` });
			else if (nb >= 3) toast.success("Bien joué !", { description: `${nb}/${TOTAL_QUESTIONS} bonnes réponses.` });
			else toast("Continuez !", { description: `${nb}/${TOTAL_QUESTIONS} bonnes réponses.` });
			navigate("/dashboard");
		}
	};

	/* ——— Écran config ——— */
	if (ecran === "config") {
		return (
			<div className="rythme-page">
				<button className="detecter-close" onClick={() => navigate("/dashboard")} aria-label="Fermer">
					<X size={16} />
				</button>

				<div className="rythme-config-content">
					<h1 className="rythme-titre">{exercice.titre}</h1>
					<p className="rythme-sous-titre">Exercice 1</p>

					<div className="rythme-badges">
						<div className="rythme-badge-item">
							<span className="rythme-badge-icon rythme-badge-icon--teal">♩♪</span>
							<span>Distinguer</span>
						</div>
						<div className="rythme-badge-item">
							<span className="rythme-badge-icon">♩♩♩</span>
							<span>{exercice.niveau}</span>
						</div>
					</div>

					<p className="rythme-description">
						Vous allez entendre deux sons : il vous faudra dire s'ils sont pareils ou différents. Entraînez-vous à différencier des sons.
					</p>

					<div className="rythme-voix-selector" role="group" aria-label="Filtre de voix">
						{(["homme", "toutes", "femme"] as TypeVoix[]).map((v) => (
							<button
								key={v}
								type="button"
								className={`rythme-voix-btn${typeVoix === v ? " rythme-voix-btn--actif" : ""}`}
								onClick={() => setTypeVoix(v)}
								aria-pressed={typeVoix === v}
							>
								<span aria-hidden="true" style={{ fontSize: "1.4rem" }}>
									{v === "homme" ? "🚹" : v === "toutes" ? "🚻" : "🚺"}
								</span>
								<span style={{ whiteSpace: "pre-line" }}>
									{v === "homme" ? "Voix\nd'homme" : v === "toutes" ? "Toutes\nles voix" : "Voix\nde femme"}
								</span>
							</button>
						))}
					</div>
				</div>

				<div className="rythme-footer">
					<button
						type="button"
						className="rythme-btn-noir"
						onClick={() => setEcran("exercice")}
					>
						Commencer l'exercice
					</button>
				</div>
			</div>
		);
	}

	/* ——— Écran exercice ——— */
	return (
		<div className="rythme-page">
			<div className="rythme-topbar">
				<button
					className="detecter-close detecter-close--inline"
					onClick={() => navigate("/dashboard")}
					aria-label="Fermer"
				>
					<X size={16} />
				</button>

				<div
					className="rythme-progress"
					role="progressbar"
					aria-valuenow={questionNum}
					aria-valuemin={1}
					aria-valuemax={TOTAL_QUESTIONS}
					aria-label={`Question ${questionNum} sur ${TOTAL_QUESTIONS}`}
				>
					{Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
						<div
							key={i}
							className={`rythme-progress-dash${i < questionNum ? " rythme-progress-dash--actif" : ""}`}
						/>
					))}
				</div>

				<div className="rythme-timer-icon" aria-hidden="true">
					<span style={{ fontSize: "0.9rem" }}>♩♪</span>
				</div>
			</div>

			<div className="rythme-config-content">
				<h2 className="rythme-titre rythme-titre--sm">
					Écoutez ces sons.{"\n"}Sont-ils différents ou identiques ?
				</h2>

				{/* Deux boutons play côte à côte */}
				<div className="distinguer-plays">
					<div className="distinguer-play-item">
						<button
							type="button"
							className={`rythme-play-sm${sonAJoue ? " rythme-play-sm--joue" : ""}`}
							onClick={jouerSonA}
							aria-label="Écouter le son A"
						>
							<span aria-hidden="true">▶</span>
						</button>
						<p className="rythme-prepa-label">Son A</p>
					</div>

					<div className="distinguer-play-item">
						<button
							type="button"
							className={`rythme-play-sm${sonBJoue ? " rythme-play-sm--joue" : ""}`}
							onClick={jouerSonB}
							aria-label="Écouter le son B"
						>
							<span aria-hidden="true">▶</span>
						</button>
						<p className="rythme-prepa-label">Son B</p>
					</div>
				</div>

				{/* Cartes réponses */}
				<div className="rythme-reponses" role="group" aria-label="Choisissez une réponse">
					<button
						type="button"
						className={`rythme-reponse-card${reponse === "identique" ? " rythme-reponse-card--select" : ""}`}
						onClick={() => setReponse("identique")}
						aria-pressed={reponse === "identique"}
					>
						<div className="rythme-reponse-icone">
							<Equal size={22} color={reponse === "identique" ? "var(--color-primary)" : "var(--color-text-muted)"} />
						</div>
						<span className="rythme-reponse-label">Identiques</span>
					</button>

					<button
						type="button"
						className={`rythme-reponse-card${reponse === "different" ? " rythme-reponse-card--select" : ""}`}
						onClick={() => setReponse("different")}
						aria-pressed={reponse === "different"}
					>
						<div className="rythme-reponse-icone">
							<Divide size={22} color={reponse === "different" ? "var(--color-primary)" : "var(--color-text-muted)"} />
						</div>
						<span className="rythme-reponse-label">Différents</span>
					</button>
				</div>
			</div>

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
		</div>
	);
};

export default DistinguerExercice;
