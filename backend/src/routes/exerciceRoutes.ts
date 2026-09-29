import { Router } from 'express';
import { getExercices, getCategories, getExerciceById, getExercicesByCategorie, getExercicesMinimal, getExercicesParNiveau } from '../controllers/exerciceController.js';

const router = Router();

router.get('/exercices', getExercices);
router.get('/exercices/minimal', getExercicesMinimal); // avant /exercices/:id (sinon "minimal" serait pris pour un id)
router.get('/exercices/:id', getExerciceById);
router.get('/categories', getCategories);
router.get('/categories/:id/exercices', getExercicesByCategorie);
router.get('/niveaux/:niveau/exercices', getExercicesParNiveau);

export default router;
