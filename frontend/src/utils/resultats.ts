import { API_URL } from "../config/api";

/** Enregistre le résultat d'un exercice. L'utilisateur est déduit du token côté serveur. */
export const enregistrerResultat = async (idExercice: number, score: number): Promise<void> => {
	const token = localStorage.getItem("token");
	await fetch(`${API_URL}/api/resultats`, {
		method: "POST",
		headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
		body: JSON.stringify({ id_exercice: idExercice, score }),
	});
};
