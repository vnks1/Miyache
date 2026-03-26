import { Router } from 'express';
import { recommendationsController } from './recommendations.controller.js';

const router = Router();

router.get('/', recommendationsController.getRecommendations);

export default router;
