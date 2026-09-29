/** Message de fin d'exercice selon le taux de réussite (score / total). */
export const getFeedbackMessage = (score: number, total: number): string => {
	if (total === 0) return "Exercice terminé !";
	const r = score / total;
	if (r >= 1) return "Score parfait ! Excellente discrimination !";
	if (r >= 0.75) return "Très bien ! Poursuivez vos efforts !";
	if (r >= 0.5) return "Pas mal ! Continuez à vous entraîner.";
	return "Ne vous découragez pas, réessayez !";
};
