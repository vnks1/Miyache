import { anilistRequest, ApiRequestError } from './anilist/client';
import { GET_MEDIA_DETAILS, GET_POPULAR_MEDIA, SEARCH_MEDIA } from './anilist/queries';
import { mapAnilistMedia, mapAnilistPageToSearchResult } from './anilist/mappers';

const CACHE_TTL = {
    popular: 60 * 60 * 1000,
    search: 5 * 60 * 1000,
    details: 24 * 60 * 60 * 1000
};

const responseCache = new Map();

function getCacheEntry(key) {
    const cached = responseCache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
        responseCache.delete(key);
        return null;
    }
    return cached.value;
}

function setCacheEntry(key, value, ttlMs) {
    responseCache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs
    });
}

function normalizeServiceError(error) {
    if (error instanceof ApiRequestError) {
        return error;
    }
    return new ApiRequestError(
        error?.message || 'Erro inesperado no serviço de mídia.',
        'unknown'
    );
}

/**
 * @param {number} [page]
 * @param {number} [perPage]
 */
export async function getPopularMedia(page = 1, perPage = 20) {
    const cacheKey = `popular:${page}:${perPage}`;
    const cached = getCacheEntry(cacheKey);
    if (cached) return cached;

    try {
        const data = await anilistRequest(GET_POPULAR_MEDIA, { page, perPage });
        const mapped = mapAnilistPageToSearchResult(data?.Page);
        setCacheEntry(cacheKey, mapped, CACHE_TTL.popular);
        return mapped;
    } catch (error) {
        throw normalizeServiceError(error);
    }
}

/**
 * @param {string} query
 * @param {number} [page]
 * @param {number} [perPage]
 */
export async function searchMedia(query, page = 1, perPage = 20) {
    if (!query || !query.trim()) {
        return {
            items: [],
            totalPages: 0,
            currentPage: page,
            totalResults: 0
        };
    }

    const normalizedQuery = query.trim();
    const cacheKey = `search:${normalizedQuery.toLowerCase()}:${page}:${perPage}`;
    const cached = getCacheEntry(cacheKey);
    if (cached) return cached;

    try {
        const data = await anilistRequest(SEARCH_MEDIA, {
            search: normalizedQuery,
            page,
            perPage
        });

        const mapped = mapAnilistPageToSearchResult(data?.Page);
        setCacheEntry(cacheKey, mapped, CACHE_TTL.search);
        return mapped;
    } catch (error) {
        throw normalizeServiceError(error);
    }
}

/**
 * @param {number} id
 */
export async function getMediaById(id) {
    const normalizedId = Number(id);
    if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
        throw new Error('ID inválido para buscar mídia.');
    }

    const cacheKey = `details:${normalizedId}`;
    const cached = getCacheEntry(cacheKey);
    if (cached) return cached;

    try {
        const data = await anilistRequest(GET_MEDIA_DETAILS, { id: normalizedId });
        if (!data?.Media) {
            throw new ApiRequestError('Mídia não encontrada na AniList.', 'graphql_error');
        }

        const mapped = mapAnilistMedia(data.Media);
        setCacheEntry(cacheKey, mapped, CACHE_TTL.details);
        return mapped;
    } catch (error) {
        throw normalizeServiceError(error);
    }
}
