import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import { getUserId } from "../hooks/useAuth";
import { X, Volume2, ChevronRight } from "lucide-react";

interface Props {
	exercice: {
		id: number;
		titre: string;
		niveau: string;
		description: string;
		type_exercice: string;
		contenu: any;
	};
}

type Ecran = "instructions" | "question" | "feedback" | "termine";

const NIVEAU_LABEL: Record<string, string> = {
	facile: "Facile",
	moyen: "Moyen",
	difficile: "Difficile",
};

/* ── Génère les questions depuis le contenu JSON ── */
type Question = {
	affichage: string;    // ce qu'on montre à l'écran (avec ......)
	tts: string;          // ce que l'app lit à voix haute (phrase complète)
	choix: string[];      // options présentées à l'utilisateur
	reponse: string;      // la bonne réponse
	contexte?: string;    // indice / thème
	pitch?: number;       // hauteur vocale (0.1 = grave, 2.0 = aigu) — Web Speech API
	volume?: number;      // volume de lecture (0.0–1.0) — fort/faible
};

function genererQuestions(contenu: any): Question[] {
	const questions: Question[] = [];

	// --- Fort ou Faible (phrases string[] + "fort" dans les instructions) ---
	if (contenu?.phrases && typeof contenu.phrases[0] === "string"
		&& contenu.instructions?.toLowerCase().includes("fort")) {
		for (const phrase of contenu.phrases as string[]) {
			const estFort = Math.random() > 0.5;
			questions.push({
				affichage: "......",
				tts: phrase,
				choix: ["Fort", "Faible"],
				reponse: estFort ? "Fort" : "Faible",
				contexte: "Cette phrase était-elle forte ou douce ?",
				volume: estFort ? 1.0 : 0.12,
			});
		}
	}

	// --- Quel mot est accentué (phrases avec mots_cles) ---
	else if (contenu?.phrases && contenu.phrases[0]?.mots_cles) {
		for (const item of contenu.phrases) {
			const reponse = item.mots_cles[Math.floor(Math.random() * item.mots_cles.length)];
			questions.push({
				affichage: item.phrase,
				tts: item.phrase,
				choix: [...item.mots_cles].sort(() => Math.random() - 0.5),
				reponse,
				contexte: "Quel mot a été accentué ?",
			});
		}
	}

	// --- Compléter une phrase / Le bon contexte ---
	else if (contenu?.phrases) {
		for (const item of contenu.phrases) {
			if (item.alternatives) {
				const reponse = item.alternatives[Math.floor(Math.random() * item.alternatives.length)];
				questions.push({
					affichage: item.phrase, // avec ......
					tts: item.phrase.replace("......", reponse), // phrase complète lue
					choix: [...item.alternatives].sort(() => Math.random() - 0.5),
					reponse,
				});
			} else if (item.texte && item.mot_cle) {
				questions.push({
					affichage: item.texte,
					tts: item.texte,
					choix: ["J'ai compris", "Je n'ai pas compris"],
					reponse: "J'ai compris",
					contexte: `Thème : ${contenu.theme || ""}`,
				});
			} else if (typeof item === "string") {
				questions.push({
					affichage: item,
					tts: item,
					choix: ["J'ai répété correctement", "Je n'ai pas réussi"],
					reponse: "J'ai répété correctement",
				});
			}
		}
	}

	// --- Pareil ou différent ---
	if (contenu?.paires && contenu.paires[0]?.mot1) {
		for (const item of contenu.paires) {
			questions.push({
				affichage: `${item.mot1}  —  ${item.mot2}`,
				tts: `${item.mot1}. ${item.mot2}`,
				choix: ["Pareil", "Différent"],
				reponse: item.resultat === "pareil" ? "Pareil" : "Différent",
				contexte: "Ces deux mots sont-ils pareils ou différents ?",
			});
		}
	}

	// --- Paires grave / aigu ---
	if (contenu?.paires && contenu.paires[0]?.mot_grave) {
		for (const item of contenu.paires) {
			// On tire aléatoirement grave ou aigu pour chaque paire
			const estGrave = Math.random() > 0.5;
			questions.push({
				affichage: "......",
				tts: estGrave ? item.mot_grave : item.mot_aigu,
				choix: ["Grave", "Aigu"],
				reponse: estGrave ? "Grave" : "Aigu",
				contexte: "Ce son est-il grave ou aigu ?",
				pitch: estGrave ? 0.4 : 1.9,
			});
		}
	}

	// --- Paires simples (syllabes) ---
	if (contenu?.paires && Array.isArray(contenu.paires[0])) {
		for (const paire of contenu.paires) {
			const reponse = paire[Math.floor(Math.random() * paire.length)];
			questions.push({
				affichage: "......",
				tts: reponse,
				choix: [...paire].sort(() => Math.random() - 0.5),
				reponse,
				contexte: "Quelle syllabe avez-vous entendue ?",
			});
		}
	}

	// --- Groupes de questions (comprendre) : { contexte, questions[] } ---
	if (contenu?.groupes && contenu.groupes[0]?.questions) {
		for (const groupe of contenu.groupes) {
			for (const question of groupe.questions as string[]) {
				questions.push({
					affichage: question,
					tts: question,
					choix: ["J'ai répété correctement", "Je n'ai pas réussi"],
					reponse: "J'ai répété correctement",
					contexte: groupe.contexte,
				});
			}
		}
	}

	// --- Groupes de mots (court_moyen_long) : string[][] ---
	if (contenu?.groupes && Array.isArray(contenu.groupes[0]) && !contenu.groupes[0]?.questions) {
		for (const groupe of contenu.groupes) {
			const reponse = groupe[Math.floor(Math.random() * groupe.length)];
			questions.push({
				affichage: "......",
				tts: reponse,
				choix: [...groupe].sort(() => Math.random() - 0.5),
				reponse,
				contexte: "Lequel de ces mots avez-vous entendu ?",
			});
		}
	}

	// --- Voyelles ---
	if (contenu?.voyelles) {
		for (const v of contenu.voyelles) {
			const autres = contenu.voyelles.filter((x: string) => x !== v).sort(() => Math.random() - 0.5).slice(0, 3);
			questions.push({
				affichage: "......",
				tts: v,
				choix: [v, ...autres].sort(() => Math.random() - 0.5),
				reponse: v,
				contexte: "Quelle voyelle avez-vous entendue ?",
			});
		}
	}

	// --- Consonnes ---
	if (contenu?.consonnes) {
		const consonnes: string[] = contenu.consonnes;
		for (const c of consonnes) {
			const autres = consonnes.filter((x: string) => x !== c).sort(() => Math.random() - 0.5).slice(0, 3);
			questions.push({
				affichage: "......",
				tts: c,
				choix: [c, ...autres].sort(() => Math.random() - 0.5),
				reponse: c,
				contexte: "Quelle consonne avez-vous entendue ?",
			});
		}
	}

	// --- Émotions ---
	if (contenu?.emotions) {
		for (const emotion of contenu.emotions) {
			const autres = contenu.emotions.filter((x: string) => x !== emotion).sort(() => Math.random() - 0.5).slice(0, 3);
			questions.push({
				affichage: `« ${contenu.phrase_support} »`,
				tts: contenu.phrase_support,
				choix: [emotion, ...autres].sort(() => Math.random() - 0.5),
				reponse: emotion,
				contexte: "Quelle émotion exprimait cette phrase ?",
			});
		}
	}

	// --- Sons / animaux / instruments ---
	if (contenu?.sons || contenu?.animaux || contenu?.instruments) {
		const items: any[] = contenu.sons || contenu.animaux || contenu.instruments;
		const noms = items.map((i: any) => i.son || i.animal || i.instrument);
		for (const item of items) {
			const nom = item.son || item.animal || item.instrument;
			const description = item.description || (item.indices ? item.indices.join(". ") : "");
			const autres = noms.filter((n: string) => n !== nom).sort(() => Math.random() - 0.5).slice(0, 3);
			questions.push({
				affichage: description,
				tts: description,
				choix: [nom, ...autres].sort(() => Math.random() - 0.5),
				reponse: nom,
				contexte: "De quoi s'agit-il ?",
			});
		}
	}

	// --- Mots courts/longs ---
	if (contenu?.mots && contenu.mots[0]?.type) {
		for (const item of contenu.mots) {
			questions.push({
				affichage: "......",
				tts: item.mot,
				choix: ["Court", "Long"],
				reponse: item.type === "court" ? "Court" : "Long",
				contexte: "Ce mot est-il court ou long ?",
			});
		}
	}

	// --- Listes à mémoriser ---
	if (contenu?.listes) {
		for (const liste of contenu.listes) {
			const elements = Array.isArray(liste) ? liste : liste.elements;
			const theme = liste.theme || "Liste";
			if (!elements) continue;
			const idx = Math.floor(Math.random() * elements.length);
			const motCache = elements[idx];
			const affichage = elements.map((e: string, i: number) => i === idx ? "......" : e).join(", ");
			const tts = elements.join(", ");
			const distracteurs = ["maison", "voiture", "soleil", "musique", "ordinateur", "téléphone"].filter((d: string) => !elements.includes(d));
			questions.push({
				affichage,
				tts,
				choix: [motCache, ...distracteurs.slice(0, 3)].sort(() => Math.random() - 0.5),
				reponse: motCache,
				contexte: `${theme} — quel mot manque ?`,
			});
		}
	}

	// --- Séquences ---
	if (contenu?.sequences) {
		for (const seq of contenu.sequences) {
			questions.push({
				affichage: seq.elements.join(" → "),
				tts: seq.elements.join(", "),
				choix: ["J'ai mémorisé dans le bon ordre", "J'ai fait une erreur"],
				reponse: "J'ai mémorisé dans le bon ordre",
				contexte: seq.contexte,
			});
		}
	}

	// --- Histoires ---
	if (contenu?.histoires) {
		for (const histoire of contenu.histoires) {
			// D'abord lire l'histoire
			questions.push({
				affichage: histoire.texte,
				tts: histoire.texte,
				choix: ["J'ai bien écouté, passer aux questions"],
				reponse: "J'ai bien écouté, passer aux questions",
				contexte: `Histoire : ${histoire.titre}`,
			});
			// Puis les questions
			for (const q of histoire.questions) {
				questions.push({
					affichage: q.question,
					tts: q.question,
					choix: ["J'ai bien répondu", "Je n'ai pas trouvé"],
					reponse: "J'ai bien répondu",
					contexte: `Histoire : ${histoire.titre} — Réponse attendue : ${q.reponse}`,
				});
			}
		}
	}

	// --- Thèmes ---
	if (contenu?.themes) {
		for (const theme of contenu.themes) {
			const items = theme.questions || theme.phrases || [];
			for (const item of items) {
				const texte = typeof item === "string" ? item : item.texte;
				questions.push({
					affichage: texte,
					tts: texte,
					choix: ["J'ai répété correctement", "Je n'ai pas compris"],
					reponse: "J'ai répété correctement",
					contexte: `Thème : ${theme.theme}`,
				});
			}
		}
	}

	// --- Rythmes ---
	if (contenu?.rythmes) {
		for (const r of contenu.rythmes) {
			questions.push({
				affichage: r.description,
				tts: r.description,
				choix: ["J'ai reproduit correctement", "Je n'ai pas réussi"],
				reponse: "J'ai reproduit correctement",
				contexte: "Reproduisez ce rythme",
			});
		}
	}

	// --- Compter les syllabes (mots réels avec nb de syllabes) ---
	if (contenu?.syllabes) {
		for (const item of contenu.syllabes) {
			questions.push({
				affichage: "......",
				tts: item.mot,
				choix: ["1 syllabe", "2 syllabes", "3 syllabes"],
				reponse: `${item.nb} syllabe${item.nb > 1 ? "s" : ""}`,
				contexte: "Combien de syllabes avez-vous entendu ?",
			});
		}
	}

	// --- Séries de syllabes ---
	if (contenu?.series) {
		const allNbs = contenu.series.map((s: any) => s.sons ?? s).filter((n: any) => typeof n === "number");
		const maxNb = Math.max(...allNbs);
		const choix = Array.from({ length: maxNb }, (_, i) => `${i + 1} syllabe${i + 1 > 1 ? "s" : ""}`);
		for (const s of contenu.series) {
			const nb: number = s.sons ?? s;
			// "ba. ba. ba." — pauses entre chaque syllabe
			const tts = Array(nb).fill("ba").join(". ");
			questions.push({
				affichage: "......",
				tts,
				choix,
				reponse: `${nb} syllabe${nb > 1 ? "s" : ""}`,
				contexte: "Combien de syllabes avez-vous entendu ?",
			});
		}
	}


	return questions.slice(0, 20);
}

/* ── TTS — voix humaine via proxy Google Translate ── */
let audioEnCours: HTMLAudioElement | null = null;
let lectureAnnulee = false;

/* Découpe le texte en morceaux ≤ 200 chars en coupant aux frontières de phrase */
const decouper = (texte: string): string[] => {
	const phrases = texte.split(/(?<=[.!?])\s+/);
	const morceaux: string[] = [];
	let courant = "";
	for (const p of phrases) {
		if ((courant + " " + p).trim().length > 190) {
			if (courant) morceaux.push(courant.trim());
			courant = p;
		} else {
			courant = courant ? courant + " " + p : p;
		}
	}
	if (courant.trim()) morceaux.push(courant.trim());
	return morceaux;
};

const lireSequence = (morceaux: string[], index: number, volume: number, onEnd?: () => void) => {
	if (lectureAnnulee || index >= morceaux.length) {
		if (onEnd) onEnd();
		return;
	}
	const url = `${API_URL}/api/tts?q=${encodeURIComponent(morceaux[index])}`;
	const audio = new Audio(url);
	audio.volume = volume;
	audioEnCours = audio;
	audio.onended = () => lireSequence(morceaux, index + 1, volume, onEnd);
	audio.play().catch(() => {
		if (lectureAnnulee) return;
		lireSequence(morceaux, index + 1, volume, onEnd);
	});
};

const lire = (texte: string, onEnd?: () => void, pitch?: number, volume = 1.0) => {
	lectureAnnulee = false;
	if (audioEnCours) {
		audioEnCours.pause();
		audioEnCours.src = '';
		audioEnCours = null;
	}
	// Si un pitch est demandé, on utilise Web Speech API (supporte grave/aigu)
	if (pitch !== undefined && window.speechSynthesis) {
		window.speechSynthesis.cancel();
		const utt = new SpeechSynthesisUtterance(texte);
		utt.lang = "fr-FR";
		utt.pitch = pitch;
		utt.rate = pitch < 1 ? 0.82 : 1.05;
		if (onEnd) utt.addEventListener("end", onEnd, { once: true });
		window.speechSynthesis.speak(utt);
		return;
	}
	const morceaux = decouper(texte);
	lireSequence(morceaux, 0, volume, onEnd);
};

const arreterLecture = () => {
	lectureAnnulee = true;
	if (audioEnCours) {
		audioEnCours.pause();
		audioEnCours.src = '';
		audioEnCours = null;
	}
};

/* ── Composant principal ── */
const ExercicePartenaire = ({ exercice }: Props) => {
	const navigate = useNavigate();
	const [ecran, setEcran] = useState<Ecran>("instructions");
	const [questions, setQuestions] = useState<Question[]>([]);
	const [index, setIndex] = useState(0);
	const [choixUser, setChoixUser] = useState<string | null>(null);
	const [score, setScore] = useState(0);
	const [aEcoute, setAEcoute] = useState(false); // choix masqués jusqu'à la 1ère écoute

	useEffect(() => {
		const contenu = typeof exercice.contenu === "string"
			? JSON.parse(exercice.contenu)
			: exercice.contenu;
		setQuestions(genererQuestions(contenu));
	}, [exercice.contenu]);

	const total = questions.length;
	const question = questions[index];
	const isCorrect = choixUser === question?.reponse;

	const jouer = useCallback(() => {
		if (!question) return;
		lire(question.tts, undefined, question.pitch, question.volume);
		setAEcoute(true);
	}, [question]);

	// Lecture auto à chaque nouvelle question
	useEffect(() => {
		if (ecran === "question" && question) {
			setAEcoute(false);
			setTimeout(() => {
				lire(question.tts, undefined, question.pitch, question.volume);
				setAEcoute(true);
			}, 400);
		}
	}, [index, ecran]);

	const valider = (choix: string) => {
		if (ecran !== "question") return;
		setChoixUser(choix);
		if (choix === question.reponse) setScore(s => s + 1);
		setEcran("feedback");
	};

	const suivant = async () => {
		if (index + 1 >= total) {
			const pct = Math.round(score / total * 100);
			const token = localStorage.getItem("token");
			await fetch(`${API_URL}/api/resultats`, {
				method: "POST",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
				body: JSON.stringify({ id_utilisateur: getUserId(), id_exercice: exercice.id, score: pct }),
			});
			setEcran("termine");
		} else {
			setIndex(i => i + 1);
			setChoixUser(null);
			setEcran("question");
		}
	};

	/* ── Instructions ── */
	if (ecran === "instructions") {
		const contenuParsed = typeof exercice.contenu === "string"
			? JSON.parse(exercice.contenu)
			: exercice.contenu;

		return (
			<div className="ep-page">
				<div className="ep-topbar">
					<button className="ep-close" onClick={() => navigate(-1)} aria-label="Fermer">
						<X size={18} strokeWidth={2.5} />
					</button>
				</div>

				<div className="ep-instructions-content">
					<div className="ep-instructions-icon" aria-hidden="true">
						<Volume2 size={36} strokeWidth={1.6} />
					</div>

					<div className="ep-instructions-header">
						<h1 className="ep-titre">{exercice.titre}</h1>
						<span className={`badge badge--${exercice.niveau}`}>{NIVEAU_LABEL[exercice.niveau]}</span>
					</div>

					<div className="ep-instructions-steps">
						<div className="ep-instructions-step">
							<div className="ep-step-num" aria-hidden="true">1</div>
							<div className="ep-step-body">
								<p className="ep-step-title">Écoutez</p>
								<p className="ep-step-desc">L'app énonce les phrases — réécoutez autant de fois que nécessaire.</p>
							</div>
						</div>
						<div className="ep-instructions-step">
							<div className="ep-step-num" aria-hidden="true">2</div>
							<div className="ep-step-body">
								<p className="ep-step-title">Répondez</p>
								<p className="ep-step-desc">
									{contenuParsed?.instructions
										? contenuParsed.instructions
										: "Sélectionnez la bonne réponse parmi les choix proposés."}
								</p>
							</div>
						</div>
					</div>

					{total > 0 && (
						<p className="ep-instructions-count">
							{total} question{total > 1 ? "s" : ""}
						</p>
					)}
				</div>

				<div className="ep-footer">
					<button className="ep-btn-primary" onClick={() => setEcran("question")}>
						C'est parti !
						<ChevronRight size={20} strokeWidth={2.5} />
					</button>
				</div>
			</div>
		);
	}

	/* ── Terminé ── */
	if (ecran === "termine") {
		const final = Math.round(score / total * 100);
		const msg = final >= 80 ? "Excellent travail !" : final >= 50 ? "Bien joué !" : "Continuez à vous entraîner !";
		return (
			<div className="ep-result">
				<h1 className="ep-result-score">
					{score} / {total} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}
				</h1>
				<div className="ep-result-ring" aria-hidden="true">
					<svg viewBox="0 0 120 120" width="160" height="160">
						<circle cx="60" cy="60" r="50" fill="none" stroke="#E2E8F0" strokeWidth="10" />
						<circle
							cx="60" cy="60" r="50"
							fill="none" stroke="#0D9488" strokeWidth="10"
							strokeLinecap="round"
							strokeDasharray={2 * Math.PI * 50}
							strokeDashoffset={2 * Math.PI * 50 * (1 - final / 100)}
							transform="rotate(-90 60 60)"
						/>
						<text x="60" y="60" textAnchor="middle" dominantBaseline="central"
							fontSize="22" fontWeight="800" fill="#0F172A">{final}%</text>
					</svg>
				</div>
				<p className="ep-result-message">{msg}</p>
				<div className="ep-result-actions">
					<button className="det-btn-outline" onClick={() => navigate(-1)}>
						Retour aux exercices
					</button>
					<button className="ep-btn-primary" onClick={() => navigate("/dashboard")}>
						Continuer
					</button>
				</div>
			</div>
		);
	}

	if (!question) return null;

	/* ── Question / Feedback ── */
	return (
		<div className="ep-page">
			{/* Topbar */}
			<div className="ep-topbar">
				<button
					className="ep-close"
					onClick={() => { if (audioEnCours) { audioEnCours.pause(); audioEnCours = null; } navigate(-1); }}
					aria-label="Fermer"
				>
					<X size={18} strokeWidth={2.5} />
				</button>
				<div
					className="ep-progress"
					role="progressbar"
					aria-valuenow={index + 1}
					aria-valuemin={1}
					aria-valuemax={total}
					aria-label={`Question ${index + 1} sur ${total}`}
				>
					{Array.from({ length: Math.min(total, 12) }).map((_, i) => (
						<div key={i} className={`ep-progress-dash${i < index ? " ep-progress-dash--actif" : i === index ? " ep-progress-dash--current" : ""}`} />
					))}
				</div>
				<span className="ep-progress-label">{index + 1} / {total}</span>
			</div>

			{/* Carte énoncé */}
			<div className="ep-exercice-content">
				<div className="ep-contenu">
					{question.contexte && <p className="ep-sequence-contexte">{question.contexte}</p>}

					<button type="button" className="ep-play-btn" onClick={jouer} aria-label="Écouter à nouveau">
						<Volume2 size={20} strokeWidth={1.8} />
						Écouter
					</button>

					{question.affichage !== "......" && question.choix[0] !== "J'ai répété correctement" && (
						<p className="ep-phrase">{question.affichage}</p>
					)}
				</div>
			</div>

			{/* Grille de choix */}
			{aEcoute ? (
				<div className="ep-choix-grid">
					{question.choix.map((choix) => {
						let cls = "ep-choix-btn";
						if (ecran === "feedback") {
							if (choix === question.reponse) cls += " ep-choix-btn--correct";
							else if (choix === choixUser) cls += " ep-choix-btn--incorrect";
							else cls += " ep-choix-btn--disabled";
						}
						return (
							<button
								key={choix}
								type="button"
								className={cls}
								onClick={() => valider(choix)}
								disabled={ecran === "feedback"}
							>
								{choix}
							</button>
						);
					})}
				</div>
			) : (
				<div className="ep-dots" role="status" aria-label="En attente d'écoute">
					<span className="ep-dot-pulse" /><span className="ep-dot-pulse" /><span className="ep-dot-pulse" />
				</div>
			)}

			{/* Feedback + bouton suivant */}
			{ecran === "feedback" ? (
				<div className={`ep-footer-feedback ${isCorrect ? "ep-footer-feedback--ok" : "ep-footer-feedback--ko"}`}>
					<p className="ep-footer-feedback-label">
						{question.choix[0] === "J'ai répété correctement"
						? `« ${question.tts} »`
						: isCorrect ? "Bonne réponse !" : `Réponse : ${question.reponse}`}
					</p>
					<button
						type="button"
						className="ep-btn-suivant-inline"
						onClick={suivant}
					>
						{index + 1 >= total ? "Voir mon score" : "Continuer"}
						<ChevronRight size={18} strokeWidth={2.5} />
					</button>
				</div>
			) : (
				<div className="ep-footer-spacer" />
			)}
		</div>
	);
};

export default ExercicePartenaire;
