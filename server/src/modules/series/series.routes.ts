import { Router } from 'express';
import { seriesController } from './series.controller.js';
import { authJWT, requireRole } from '../../middlewares/auth.js';
import { validate, validateQuery } from '../../middlewares/validate.js';
import {
  createSeriesSchema,
  updateSeriesSchema,
  listSeriesQuerySchema,
} from './series.schemas.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authJWT);

// GET /api/series (lista com filtros)
router.get('/', validateQuery(listSeriesQuerySchema), (req, res) =>
  seriesController.list(req, res)
);

// GET /api/series/stats
router.get('/stats', (req, res) => seriesController.getStats(req, res));

// GET /api/series/audit (últimas alterações)
router.get('/audit', (req, res) => seriesController.getAuditLogs(req, res));

// POST /api/series (criar/importar)
router.post('/', validate(createSeriesSchema), (req, res) =>
  seriesController.create(req, res)
);

// GET /api/series/:id
router.get('/:id', (req, res) => seriesController.getById(req, res));

// GET /api/series/:id/audit
router.get('/:id/audit', (req, res) => seriesController.getAuditLogsById(req, res));

// PATCH /api/series/:id (atualizar overrides)
router.patch('/:id', validate(updateSeriesSchema), (req, res) =>
  seriesController.update(req, res)
);

// POST /api/series/:id/archive
router.post('/:id/archive', (req, res) => seriesController.archive(req, res));

// POST /api/series/:id/unarchive
router.post('/:id/unarchive', (req, res) => seriesController.unarchive(req, res));

// POST /api/series/:id/publish
router.post('/:id/publish', (req, res) => seriesController.publish(req, res));

// POST /api/series/:id/unpublish
router.post('/:id/unpublish', (req, res) => seriesController.unpublish(req, res));

// POST /api/series/:id/sync
router.post('/:id/sync', (req, res) => seriesController.sync(req, res));

// DELETE /api/series/:id (apenas admin)
router.delete('/:id', requireRole(['admin']), (req, res) =>
  seriesController.delete(req, res)
);

export default router;
