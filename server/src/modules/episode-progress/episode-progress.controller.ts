import { Request, Response } from 'express';
import { success, error } from '../../utils/apiResponse.js';
import { episodeProgressService, type EpisodeProgressInput } from './episode-progress.service.js';

export class EpisodeProgressController {
  async getByEpisodeKey(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(error('UNAUTHORIZED', 'Não autenticado'));
      }

      const progress = await episodeProgressService.getByEpisodeKey(
        req.user.userId,
        req.params.episodeKey
      );

      res.json(success(progress));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar progresso do episódio';
      res.status(500).json(error('EPISODE_PROGRESS_ERROR', message));
    }
  }

  async upsert(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(error('UNAUTHORIZED', 'Não autenticado'));
      }

      const episodeKey = req.params.episodeKey?.trim();
      const input = req.body as Partial<EpisodeProgressInput>;

      if (!episodeKey) {
        return res.status(400).json(error('VALIDATION', 'episodeKey is required.'));
      }

      if (!input.source || !input.animeTitle) {
        return res.status(400).json(error('VALIDATION', 'source and animeTitle are required.'));
      }

      const progress = await episodeProgressService.upsert(req.user.userId, {
        episodeKey,
        source: input.source,
        tmdbShowId: input.tmdbShowId ?? null,
        seasonNumber: input.seasonNumber ?? null,
        episodeNumber: input.episodeNumber ?? null,
        animeTitle: input.animeTitle,
        episodeTitle: input.episodeTitle ?? null,
        overview: input.overview ?? null,
        stillPath: input.stillPath ?? null,
        backdropPath: input.backdropPath ?? null,
        watched: input.watched ?? false,
        rating: input.rating ?? null,
      });

      res.status(201).json(success(progress));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar progresso do episódio';
      res.status(400).json(error('EPISODE_PROGRESS_ERROR', message));
    }
  }
}

export const episodeProgressController = new EpisodeProgressController();
