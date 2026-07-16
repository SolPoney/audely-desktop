import { Router } from 'express';
import { getStats, getExercicesCompletes } from '../controllers/statsController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/stats', verifyToken, getStats);
router.get('/stats/completes', verifyToken, getExercicesCompletes);

export default router;
