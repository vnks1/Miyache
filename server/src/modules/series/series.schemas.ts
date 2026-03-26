import { z } from 'zod';

// Schema para criar série manual
export const createSeriesManualSchema = z.object({
  source: z.literal('manual'),
  title: z.string().min(1, 'Título obrigatório'),
  originalTitle: z.string().optional(),
  overview: z.string().optional(),
  posterPath: z.string().optional(),
  backdropPath: z.string().optional(),
  genresJson: z.string().optional(),
  rating: z.number().optional(),
  releaseDate: z.string().optional(),
  status: z.string().optional(),
  visibility: z.enum(['draft', 'published', 'archived']).default('draft'),
  isFeatured: z.boolean().default(false),
  featuredOrder: z.number().optional(),
});

// Schema para importar série do TMDB
export const createSeriesFromTmdbSchema = z.object({
  source: z.literal('tmdb'),
  tmdbId: z.number().int().positive(),
  visibility: z.enum(['draft', 'published', 'archived']).default('draft'),
  isFeatured: z.boolean().default(false),
  featuredOrder: z.number().optional(),
});

// Union dos dois schemas
export const createSeriesSchema = z.discriminatedUnion('source', [
  createSeriesManualSchema,
  createSeriesFromTmdbSchema,
]);

// Schema para atualizar série (apenas overrides e flags)
export const updateSeriesSchema = z.object({
  titleOverride: z.string().optional(),
  overviewOverride: z.string().optional(),
  tagsJson: z.string().optional(),
  visibility: z.enum(['draft', 'published', 'archived']).optional(),
  isFeatured: z.boolean().optional(),
  featuredOrder: z.number().nullable().optional(),
});

// Schema para query params de listagem
export const listSeriesQuerySchema = z.object({
  query: z.string().optional(),
  visibility: z.enum(['draft', 'published', 'archived']).optional(),
  source: z.enum(['tmdb', 'manual']).optional(),
  featured: z.string().optional().transform(val => val === 'true'),
  page: z.string().optional().transform(val => parseInt(val || '1', 10)),
  pageSize: z.string().optional().transform(val => parseInt(val || '20', 10)),
});

export type CreateSeriesInput = z.infer<typeof createSeriesSchema>;
export type UpdateSeriesInput = z.infer<typeof updateSeriesSchema>;
export type ListSeriesQuery = z.infer<typeof listSeriesQuerySchema>;
