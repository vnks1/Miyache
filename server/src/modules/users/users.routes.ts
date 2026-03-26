import { Router } from 'express';
import { usersController } from './users.controller.js';

const router = Router();

router.post('/', usersController.createUser);
router.post('/:nick/anime', usersController.saveAnime);
router.get('/:nick/anime', usersController.getSavedAnime);
router.post('/:nick/anilist', usersController.saveAniListAnime);
router.get('/:nick/anilist', usersController.getSavedAniListAnime);

export default router;
