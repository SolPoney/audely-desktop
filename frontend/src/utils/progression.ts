export interface ExerciceProgression {
	id: number;
	niveau: string;
	categorie_id?: number;
}

const NIVEAUX = ["facile", "moyen", "difficile"];

/**
 * Règle unique de déblocage, utilisée par ExercicePage, ExercicesCatPage et
 * ParcoursListePage : un exercice est débloqué s'il est déjà complété, ou si
 * tous les exercices des niveaux précédents (même catégorie) sont complétés
 * et que l'exercice précédent du même niveau (même catégorie) l'est aussi.
 *
 * Avant ce module, chaque page réimplémentait sa propre version de cette
 * règle, et elles n'étaient pas d'accord entre elles : un même exercice
 * pouvait apparaître verrouillé sur une page et débloqué sur une autre.
 */
export const isExerciceUnlocked = (
	exercice: ExerciceProgression,
	tousLesExercices: ExerciceProgression[],
	completes: Set<number>,
): boolean => {
	if (completes.has(exercice.id)) return true;

	const memeCategorie = exercice.categorie_id !== undefined
		? tousLesExercices.filter((e) => e.categorie_id === exercice.categorie_id)
		: tousLesExercices;

	const niveauIdx = NIVEAUX.indexOf(exercice.niveau);
	for (let n = 0; n < niveauIdx; n++) {
		const exosNiveau = memeCategorie.filter((e) => e.niveau === NIVEAUX[n]);
		if (exosNiveau.some((e) => !completes.has(e.id))) return false;
	}

	const exosMemeNiveau = memeCategorie.filter((e) => e.niveau === exercice.niveau);
	const pos = exosMemeNiveau.findIndex((e) => e.id === exercice.id);
	if (pos > 0 && !completes.has(exosMemeNiveau[pos - 1].id)) return false;

	return true;
};
