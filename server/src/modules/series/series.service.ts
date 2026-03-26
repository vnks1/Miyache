import { seriesRepository } from './series.repository.js';
import { tmdbService } from '../tmdb/tmdb.service.js';
import { auditService } from '../audit/audit.service.js';
import { CreateSeriesInput, UpdateSeriesInput, ListSeriesQuery } from './series.schemas.js';

export class SeriesService {
  /**
   * Listar séries
   */
  async list(query: ListSeriesQuery) {
    return await seriesRepository.list(query);
  }

  /**
   * Buscar série por ID
   */
  async getById(id: string) {
    const series = await seriesRepository.findById(id);
    if (!series) {
      throw new Error('Série não encontrada');
    }
    return series;
  }

  /**
   * Criar série (manual ou importar do TMDB)
   */
  async create(input: CreateSeriesInput, userId: string) {
    let seriesData;

    if (input.source === 'tmdb') {
      // Importar do TMDB
      const tmdbShow = await tmdbService.getAnimeById(input.tmdbId);
      const formatted = tmdbService.formatForDatabase(tmdbShow);

      // Verificar se já existe
      if (formatted.tmdbId) {
        const existing = await seriesRepository.findByTmdbId(formatted.tmdbId);
        if (existing) {
          throw new Error('Anime já importado');
        }
      }

      seriesData = {
        ...formatted,
        source: 'tmdb',
        visibility: input.visibility,
        isFeatured: input.isFeatured,
        featuredOrder: input.featuredOrder,
      };
    } else {
      // Criar manual
      seriesData = {
        title: input.title,
        originalTitle: input.originalTitle || null,
        overview: input.overview || null,
        posterPath: input.posterPath || null,
        backdropPath: input.backdropPath || null,
        genresJson: input.genresJson || null,
        rating: input.rating || null,
        releaseDate: input.releaseDate || null,
        status: input.status || null,
        source: 'manual',
        visibility: input.visibility,
        isFeatured: input.isFeatured,
        featuredOrder: input.featuredOrder,
      };
    }

    const series = await seriesRepository.create(seriesData);

    // Audit log
    await auditService.log({
      userId,
      entity: 'Series',
      entityId: series.id,
      action: input.source === 'tmdb' ? 'import' : 'create',
      after: series,
    });

    return series;
  }

  /**
   * Atualizar série (apenas overrides e flags)
   */
  async update(id: string, input: UpdateSeriesInput, userId: string) {
    const before = await this.getById(id);

    const updated = await seriesRepository.update(id, input);

    // Audit log
    await auditService.log({
      userId,
      entity: 'Series',
      entityId: id,
      action: 'update',
      before,
      after: updated,
    });

    return updated;
  }

  /**
   * Arquivar série (soft delete)
   */
  async archive(id: string, userId: string) {
    const before = await this.getById(id);

    const updated = await seriesRepository.update(id, {
      visibility: 'archived',
    });

    await auditService.log({
      userId,
      entity: 'Series',
      entityId: id,
      action: 'archive',
      before,
      after: updated,
    });

    return updated;
  }

  /**
   * Desarquivar série
   */
  async unarchive(id: string, userId: string) {
    const before = await this.getById(id);

    const updated = await seriesRepository.update(id, {
      visibility: 'draft',
    });

    await auditService.log({
      userId,
      entity: 'Series',
      entityId: id,
      action: 'unarchive',
      before,
      after: updated,
    });

    return updated;
  }

  /**
   * Publicar série
   */
  async publish(id: string, userId: string) {
    const before = await this.getById(id);

    const updated = await seriesRepository.update(id, {
      visibility: 'published',
    });

    await auditService.log({
      userId,
      entity: 'Series',
      entityId: id,
      action: 'publish',
      before,
      after: updated,
    });

    return updated;
  }

  /**
   * Despublicar série
   */
  async unpublish(id: string, userId: string) {
    const before = await this.getById(id);

    const updated = await seriesRepository.update(id, {
      visibility: 'draft',
    });

    await auditService.log({
      userId,
      entity: 'Series',
      entityId: id,
      action: 'unpublish',
      before,
      after: updated,
    });

    return updated;
  }

  /**
   * Sincronizar dados do TMDB
   * CRÍTICO: Atualiza APENAS campos espelhados, PRESERVA overrides
   */
  async sync(id: string, userId: string) {
    const before = await this.getById(id);

    if (before.source !== 'tmdb' || !before.tmdbId) {
      throw new Error('Série não é do TMDB');
    }

    // Buscar dados atualizados do TMDB
    const tmdbShow = await tmdbService.getAnimeById(before.tmdbId);
    const formatted = tmdbService.formatForDatabase(tmdbShow);

    // Atualizar APENAS campos espelhados
    // NÃO sobrescrever overrides (titleOverride, overviewOverride, tagsJson)
    // NÃO alterar visibility, isFeatured, featuredOrder
    const updated = await seriesRepository.update(id, {
      title: formatted.title,
      originalTitle: formatted.originalTitle,
      overview: formatted.overview,
      posterPath: formatted.posterPath,
      backdropPath: formatted.backdropPath,
      genresJson: formatted.genresJson,
      rating: formatted.rating,
      releaseDate: formatted.releaseDate,
      status: formatted.status,
      // Overrides e flags permanecem intocados
    });

    await auditService.log({
      userId,
      entity: 'Series',
      entityId: id,
      action: 'sync',
      before,
      after: updated,
    });

    return updated;
  }

  /**
   * Deletar série (hard delete, apenas admin)
   */
  async delete(id: string, userId: string) {
    const before = await this.getById(id);

    await seriesRepository.delete(id);

    await auditService.log({
      userId,
      entity: 'Series',
      entityId: id,
      action: 'delete',
      before,
    });

    return { deleted: true };
  }

  /**
   * Obter estatísticas
   */
  async getStats() {
    return await seriesRepository.getStats();
  }
}

export const seriesService = new SeriesService();
