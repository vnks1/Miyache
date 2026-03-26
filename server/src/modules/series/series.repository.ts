import prisma from '../../db/client.js';
import { ListSeriesQuery } from './series.schemas.js';
import { Prisma } from '@prisma/client';

export class SeriesRepository {
  /**
   * Listar séries com filtros e paginação
   */
  async list(query: ListSeriesQuery) {
    const where: Prisma.SeriesWhereInput = {};

    // Filtro por texto (busca em title, originalTitle, titleOverride)
    if (query.query) {
      where.OR = [
        { title: { contains: query.query, mode: 'insensitive' } },
        { originalTitle: { contains: query.query, mode: 'insensitive' } },
        { titleOverride: { contains: query.query, mode: 'insensitive' } },
      ];
    }

    // Filtro por visibilidade
    if (query.visibility) {
      where.visibility = query.visibility;
    }

    // Filtro por source
    if (query.source) {
      where.source = query.source;
    }

    // Filtro por featured
    if (query.featured) {
      where.isFeatured = true;
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // Ordenação: featured primeiro (por order), depois updatedAt desc
    const orderBy: Prisma.SeriesOrderByWithRelationInput[] = [
      { isFeatured: 'desc' },
      { featuredOrder: 'asc' },
      { updatedAt: 'desc' },
    ];

    const [items, total] = await Promise.all([
      prisma.series.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.series.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Buscar série por ID
   */
  async findById(id: string) {
    return await prisma.series.findUnique({ where: { id } });
  }

  /**
   * Buscar série por TMDB ID
   */
  async findByTmdbId(tmdbId: number) {
    return await prisma.series.findUnique({ where: { tmdbId } });
  }

  /**
   * Criar nova série
   */
  async create(data: Prisma.SeriesCreateInput) {
    return await prisma.series.create({ data });
  }

  /**
   * Atualizar série
   */
  async update(id: string, data: Prisma.SeriesUpdateInput) {
    return await prisma.series.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletar série (hard delete)
   */
  async delete(id: string) {
    return await prisma.series.delete({ where: { id } });
  }

  /**
   * Estatísticas de séries por visibilidade
   */
  async getStats() {
    const [total, published, draft, archived, featured] = await Promise.all([
      prisma.series.count(),
      prisma.series.count({ where: { visibility: 'published' } }),
      prisma.series.count({ where: { visibility: 'draft' } }),
      prisma.series.count({ where: { visibility: 'archived' } }),
      prisma.series.count({ where: { isFeatured: true } }),
    ]);

    return { total, published, draft, archived, featured };
  }
}

export const seriesRepository = new SeriesRepository();
