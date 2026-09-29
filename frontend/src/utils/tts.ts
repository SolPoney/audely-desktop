let audioEnCours: HTMLAudioElement | null = null;

/**
 * Lit un texte court à voix haute : essaie d'abord le proxy TTS (voix neurale),
 * puis se rabat sur la synthèse vocale du navigateur si celui-ci échoue.
 * `onEnd` est toujours appelé, même si aucune des deux méthodes ne fonctionne,
 * pour ne jamais bloquer l'exercice en attente d'un callback qui ne viendra pas.
 */
export const lireTexte = (apiUrl: string, texte: string, onEnd?: () => void, rate = 0.88) => {
	if (audioEnCours) { audioEnCours.pause(); audioEnCours.src = ""; audioEnCours = null; }
	const audio = new Audio(`${apiUrl}/api/tts?q=${encodeURIComponent(texte)}`);
	audioEnCours = audio;
	if (onEnd) audio.addEventListener("ended", onEnd, { once: true });
	audio.play().catch(() => {
		if (!window.speechSynthesis) { onEnd?.(); return; }
		window.speechSynthesis.cancel();
		const utt = new SpeechSynthesisUtterance(texte);
		utt.lang = "fr-FR";
		utt.rate = rate;
		if (onEnd) utt.addEventListener("end", onEnd, { once: true });
		window.speechSynthesis.speak(utt);
	});
};

/** Coupe la lecture audio en cours (pas la synthèse vocale du navigateur). */
export const arreterLectureAudio = () => {
	if (audioEnCours) {
		audioEnCours.pause();
		audioEnCours = null;
	}
};
