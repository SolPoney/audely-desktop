import { Router } from 'express';
import { getVapidPublicKey, subscribe, unsubscribe, declencherRappels } from '../controllers/pushController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/push/vapid-public-key', getVapidPublicKey);
router.post('/push/subscribe', verifyToken, subscribe);
router.post('/push/unsubscribe', verifyToken, unsubscribe);
// Pas de verifyToken : appelée par un cron externe, protégée par CRON_SECRET.
router.post('/cron/rappels', declencherRappels);

export default router;
