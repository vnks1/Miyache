// Types compartilhados entre frontend e backend

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor';
  createdAt: string;
}

export interface Series {
  id: string;
  // TMDB espelhado
  tmdbId: number | null;
  title: string;
  originalTitle: string | null;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  genresJson: string | null;
  rating: number | null;
  releaseDate: string | null;
  status: string | null;
  // Overrides locais
  titleOverride: string | null;
  overviewOverride: string | null;
  tagsJson: string | null;
  // Controle
  visibility: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  featuredOrder: number | null;
  source: 'tmdb' | 'manual';
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  entity: string;
  entityId: string;
  action: string;
  beforeJson: string | null;
  afterJson: string | null;
  createdAt: string;
  user: {
    email: string;
    role: string;
  };
}

export interface SeriesStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  featured: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiSuccessResponse<T = unknown> {
  ok: true;
  data: T;
}

export interface ApiErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface TmdbShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date: string;
  genres?: Array<{ id: number; name: string }>;
}
