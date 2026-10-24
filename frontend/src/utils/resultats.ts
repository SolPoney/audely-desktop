import { API_URL } from "../config/api";

export interface GainSerie {
	streakAvant: number;
	streakActuelle: number;
	streakRecord: number;
	gelUtilise: boolean;
	gelsDisponibles: number;
	nouveauRecord: boolean;
}

export interface GainXP {
	montantBase: number;
	bonus: number;
	total: number;
}

export interface ResultatEnregistre {
	serie?: GainSerie;
	xp?: GainXP;
}

/**
 * Enregistre le résultat d'un exercice. L'utilisateur est déduit du token
 * côté serveur. Renvoie les gains (XP, série) pour l'écran de fin — `null`
 * si l'enregistrement a échoué (réseau, serveur).
 */
export const enregistrerResultat = async (idExercice: number, score: number): Promise<ResultatEnregistre | null> => {
	const token = localStorage.getItem("token");
	try {
		const res = await fetch(`${API_URL}/api/resultats`, {
			method: "POST",
			headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
			body: JSON.stringify({ id_exercice: idExercice, score }),
		});
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
};
