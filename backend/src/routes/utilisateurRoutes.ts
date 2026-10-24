import { Router } from 'express';
import { completerOnboarding } from '../controllers/utilisateurController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.put('/utilisateur/onboarding', verifyToken, completerOnboarding);

export default router;
