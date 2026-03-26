import { Router } from 'express';
import { tmdbController } from './tmdb.controller.js';
import { authJWT } from '../../middlewares/auth.js';

const router = Router();

// Todas as rotas TMDB requerem autenticação
router.use(authJWT);

// GET /api/tmdb/search
router.get('/search', (req, res) => tmdbController.search(req, res));

// GET /api/tmdb/anime/:tmdbId
router.get('/anime/:tmdbId', (req, res) => tmdbController.getAnime(req, res));

export default router;
