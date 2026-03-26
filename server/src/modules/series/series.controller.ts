import { Request, Response } from 'express';
import { seriesService } from './series.service.js';
import { auditService } from '../audit/audit.service.js';
import { success, error } from '../../utils/apiResponse.js';
import { CreateSeriesInput, UpdateSeriesInput, ListSeriesQuery } from './series.schemas.js';

export class SeriesController {
  /**
   * GET /api/series
   */
  async list(req: Request, res: Response) {
    try {
      const query = req.query as unknown as ListSeriesQuery;
      const result = await seriesService.list(query);
      res.json(success(result));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao listar séries';
      res.status(500).json(error('LIST_ERROR', message));
    }
  }

  /**
   * GET /api/series/stats
   */
  async getStats(_req: Request, res: Response) {
    try {
      const stats = await seriesService.getStats();
      res.json(success(stats));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao obter estatísticas';
      res.status(500).json(error('STATS_ERROR', message));
    }
  }

  /**
   * GET /api/series/audit
   */
  async getAuditLogs(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const logs = await auditService.getRecent(limit);
      res.json(success(logs));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar audit logs';
      res.status(500).json(error('AUDIT_ERROR', message));
    }
  }

  /**
   * GET /api/series/:id
   */
  async getById(req: Request, res: Response) {
    try {
      const series = await seriesService.getById(req.params.id);
      res.json(success(series));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Série não encontrada';
      res.status(404).json(error('NOT_FOUND', message));
    }
  }

  /**
   * GET /api/series/:id/audit
   */
  async getAuditLogsById(req: Request, res: Response) {
    try {
      const logs = await auditService.getByEntity('Series', req.params.id);
      res.json(success(logs));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar histórico';
      res.status(500).json(error('AUDIT_ERROR', message));
    }
  }

  /**
   * POST /api/series
   */
  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(error('UNAUTHORIZED', 'Não autenticado'));
      }

      const input = req.body as CreateSeriesInput;
      const series = await seriesService.create(input, req.user.userId);
      res.status(201).json(success(series));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar série';
      res.status(400).json(error('CREATE_ERROR', message));
    }
  }

  /**
   * PATCH /api/series/:id
   */
  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(error('UNAUTHORIZED', 'Não autenticado'));
      }

      const input = req.body as UpdateSeriesInput;
      const series = await seriesService.update(req.params.id, input, req.user.userId);
      res.json(success(series));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar série';
      res.status(400).json(error('UPDATE_ERROR', message));
    }
  }

  /**
   * POST /api/series/:id/archive
   */
  async archive(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(error('UNAUTHORIZED', 'Não autenticado'));
      }

      const series = await seriesService.archive(req.params.id, req.user.userId);
      res.json(success(series));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao arquivar série';
      res.status(400).json(error('ARCHIVE_ERROR', message));
    }
  }

  /**
   * POST /api/series/:id/unarchive
   */
  async unarchive(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(error('UNAUTHORIZED', 'Não autenticado'));
      }

      const series = await seriesService.unarchive(req.params.id, req.user.userId);
      res.json(success(series));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao desarquivar série';
      res.status(400).json(error('UNARCHIVE_ERROR', message));
    }
  }

  /**
   * POST /api/series/:id/publish
   */
  async publish(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(error('UNAUTHORIZED', 'Não autenticado'));
      }

      const series = await seriesService.publish(req.params.id, req.user.userId);
      res.json(success(series));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao publicar série';
      res.status(400).json(error('PUBLISH_ERROR', message));
    }
  }

  /**
   * POST /api/series/:id/unpublish
   */
  async unpublish(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(error('UNAUTHORIZED', 'Não autenticado'));
      }

      const series = await seriesService.unpublish(req.params.id, req.user.userId);
      res.json(success(series));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao despublicar série';
      res.status(400).json(error('UNPUBLISH_ERROR', message));
    }
  }

  /**
   * POST /api/series/:id/sync
   */
  async sync(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(error('UNAUTHORIZED', 'Não autenticado'));
      }

      const series = await seriesService.sync(req.params.id, req.user.userId);
      res.json(success(series));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao sincronizar série';
      res.status(400).json(error('SYNC_ERROR', message));
    }
  }

  /**
   * DELETE /api/series/:id
   */
  async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(error('UNAUTHORIZED', 'Não autenticado'));
      }

      const result = await seriesService.delete(req.params.id, req.user.userId);
      res.json(success(result));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar série';
      res.status(400).json(error('DELETE_ERROR', message));
    }
  }
}

export const seriesController = new SeriesController();
