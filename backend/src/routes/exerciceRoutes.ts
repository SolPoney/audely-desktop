import { Router } from 'express';
import { getExercices, getCategories } from '../controllers/exerciceController.js';
import { getExercices, getCategories, getExerciceById } from '../controllers/exerciceController.js';


const router = Router();

router.get('/exercices', getExercices);
router.get('/categories', getCategories);
router.get('/exercices/:id', getExerciceById);



export default router;
