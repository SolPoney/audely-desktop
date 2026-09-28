export type NiveauBruit = "silence" | "leger" | "fort";

const GAIN_PAR_NIVEAU: Record<NiveauBruit, number> = {
	silence: 0,
	leger: 0.035,
	fort: 0.09,
};

/** Niveau de bruit de fond par défaut selon la difficulté de l'exercice (rapport signal/bruit variable). */
export const niveauBruitParDefaut = (niveau: string): NiveauBruit => {
	if (niveau === "difficile") return "fort";
	if (niveau === "moyen") return "leger";
	return "silence";
};

/** Démarre un bruit ambiant (bruit blanc filtré, en boucle) simulant un environnement chargé. */
export const demarrerBruitFond = (ctx: AudioContext, niveau: NiveauBruit) => {
	const gain = GAIN_PAR_NIVEAU[niveau];
	if (gain <= 0) return { stop: () => {} };

	const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

	const source = ctx.createBufferSource();
	source.buffer = buffer;
	source.loop = true;

	const filtre = ctx.createBiquadFilter();
	filtre.type = "lowpass";
	filtre.frequency.value = 1200;

	const gainNode = ctx.createGain();
	gainNode.gain.value = gain;

	source.connect(filtre);
	filtre.connect(gainNode);
	gainNode.connect(ctx.destination);
	source.start();

	return {
		stop: () => {
			try { source.stop(); } catch { /* déjà arrêté */ }
			source.disconnect();
			filtre.disconnect();
			gainNode.disconnect();
		},
	};
};
