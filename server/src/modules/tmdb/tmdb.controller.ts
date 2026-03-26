import { Request, Response } from 'express';
import { tmdbService } from './tmdb.service.js';
import { success, error } from '../../utils/apiResponse.js';

export class TmdbController {
  /**
   * GET /api/tmdb/search?query=...
   */
  async search(req: Request, res: Response) {
    try {
      const query = req.query.query as string;

      if (!query || query.trim().length === 0) {
        return res.status(400).json(error('INVALID_QUERY', 'Query obrigatória'));
      }

      const results = await tmdbService.searchAnime(query);
      res.json(success(results));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar no TMDB';
      res.status(500).json(error('TMDB_ERROR', message));
    }
  }

  /**
   * GET /api/tmdb/anime/:tmdbId
   */
  async getAnime(req: Request, res: Response) {
    try {
      const tmdbId = parseInt(req.params.tmdbId, 10);

      if (isNaN(tmdbId)) {
        return res.status(400).json(error('INVALID_ID', 'TMDB ID inválido'));
      }

      const show = await tmdbService.getAnimeById(tmdbId);
      res.json(success(show));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar anime';
      res.status(404).json(error('ANIME_NOT_FOUND', message));
    }
  }
}

export const tmdbController = new TmdbController();
