import { Router } from 'express';
import { getExercices, getCategories } from '../controllers/exerciceController.js';

const router = Router();

router.get('/exercices', getExercices);
router.get('/categories', getCategories);


export default router;
