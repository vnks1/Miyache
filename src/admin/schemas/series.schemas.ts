import { z } from 'zod';

// Login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Create Series Manual
export const createSeriesManualSchema = z.object({
  source: z.literal('manual'),
  title: z.string().min(1, 'Título obrigatório'),
  originalTitle: z.string().optional(),
  overview: z.string().optional(),
  posterPath: z.string().optional(),
  backdropPath: z.string().optional(),
  visibility: z.enum(['draft', 'published', 'archived']).default('draft'),
  isFeatured: z.boolean().default(false),
  featuredOrder: z.coerce.number().optional(),
});

// Import Series from TMDB
export const createSeriesFromTmdbSchema = z.object({
  source: z.literal('tmdb'),
  tmdbId: z.number().int().positive(),
  visibility: z.enum(['draft', 'published', 'archived']).default('draft'),
  isFeatured: z.boolean().default(false),
  featuredOrder: z.coerce.number().optional(),
});

export const createSeriesSchema = z.discriminatedUnion('source', [
  createSeriesManualSchema,
  createSeriesFromTmdbSchema,
]);

// Update Series (apenas overrides)
export const updateSeriesSchema = z.object({
  titleOverride: z.string().optional(),
  overviewOverride: z.string().optional(),
  tagsJson: z.string().optional(),
  visibility: z.enum(['draft', 'published', 'archived']).optional(),
  isFeatured: z.boolean().optional(),
  featuredOrder: z.coerce.number().nullable().optional(),
});

export type CreateSeriesInput = z.infer<typeof createSeriesSchema>;
export type UpdateSeriesInput = z.infer<typeof updateSeriesSchema>;
