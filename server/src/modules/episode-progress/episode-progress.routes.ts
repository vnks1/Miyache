import { Router } from 'express';
import { authJWT } from '../../middlewares/auth.js';
import { episodeProgressController } from './episode-progress.controller.js';

const router = Router();

router.use(authJWT);

router.get('/:episodeKey', (req, res) => episodeProgressController.getByEpisodeKey(req, res));
router.put('/:episodeKey', (req, res) => episodeProgressController.upsert(req, res));

export default router;
