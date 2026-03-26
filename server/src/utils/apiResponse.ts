/**
 * Padrão de resposta da API
 */

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

export function success<T>(data: T): ApiSuccessResponse<T> {
  return { ok: true, data };
}

export function error(
  code: string,
  message: string,
  details?: unknown
): ApiErrorResponse {
  return {
    ok: false,
    error: { code, message, details },
  };
}
