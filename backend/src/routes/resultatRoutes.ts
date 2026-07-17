import { Router } from 'express';
import { saveResultat } from '../controllers/resultatController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/resultats', verifyToken, saveResultat);

export default router;
