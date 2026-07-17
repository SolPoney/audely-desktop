import { Router } from 'express';
import { getQueteDuJour } from '../controllers/queteController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/quete-du-jour', verifyToken, getQueteDuJour);

export default router;
