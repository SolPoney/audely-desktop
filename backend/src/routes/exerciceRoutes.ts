import { Router } from 'express';
import { getExercices, getCategories, getExerciceById, getExercicesByCategorie } from '../controllers/exerciceController.js';

const router = Router();

router.get('/exercices', getExercices);
router.get('/exercices/:id', getExerciceById);
router.get('/categories', getCategories);
router.get('/categories/:id/exercices', getExercicesByCategorie);

export default router;
