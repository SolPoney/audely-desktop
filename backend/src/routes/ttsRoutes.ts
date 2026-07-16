import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/tts?q=texte
 * Proxy vers Google Translate TTS — retourne un flux MP3 avec une voix neurale française.
 * Pas de clé API requise.
 */
router.get('/tts', async (req: Request, res: Response) => {
	const texte = (req.query.q as string) ?? '';
	if (!texte.trim()) {
		res.status(400).json({ error: 'Paramètre q manquant.' });
		return;
	}

	const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(texte)}&tl=fr&client=tw-ob&ttsspeed=0.9`;

	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
				'Referer': 'https://translate.google.com/',
			},
		});

		if (!response.ok) {
			res.status(502).json({ error: 'Erreur du service TTS.' });
			return;
		}

		res.set('Content-Type', 'audio/mpeg');
		res.set('Cache-Control', 'public, max-age=3600');

		const buffer = await response.arrayBuffer();
		res.send(Buffer.from(buffer));
	} catch {
		res.status(502).json({ error: 'Impossible de contacter le service TTS.' });
	}
});

export default router;
