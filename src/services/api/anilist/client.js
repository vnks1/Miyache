const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

export class ApiRequestError extends Error {
    /**
     * @param {string} message
     * @param {'rate_limit'|'http_error'|'network_error'|'graphql_error'|'unknown'} code
     * @param {number|null} [status]
     */
    constructor(message, code, status = null) {
        super(message);
        this.name = 'ApiRequestError';
        this.code = code;
        this.status = status;
    }
}

/**
 * @template T
 * @param {string} query
 * @param {Record<string, unknown>} [variables]
 * @returns {Promise<T>}
 */
export async function anilistRequest(query, variables = {}) {
    let response;
    try {
        response = await fetch(ANILIST_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({ query, variables })
        });
    } catch (error) {
        throw new ApiRequestError(
            'Falha de rede ao comunicar com AniList.',
            'network_error'
        );
    }

    if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        throw new ApiRequestError(
            `Rate limit da AniList. Tente novamente em ${retryAfter}s.`,
            'rate_limit',
            429
        );
    }

    if (!response.ok) {
        throw new ApiRequestError(
            `AniList error: ${response.status}`,
            'http_error',
            response.status
        );
    }

    const json = await response.json();
    if (json?.errors?.length) {
        throw new ApiRequestError(
            json.errors[0].message || 'Erro desconhecido da AniList.',
            'graphql_error',
            response.status
        );
    }

    return json.data;
}

export { ANILIST_ENDPOINT };
