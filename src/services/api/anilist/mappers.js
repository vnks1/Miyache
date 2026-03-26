/**
 * @param {string} value
 * @returns {string}
 */
function stripHtml(value) {
    return (value || '').replace(/<[^>]+>/g, '').trim();
}

/**
 * @param {string} text
 * @returns {string}
 */
function decodeBasicEntities(text) {
    return text
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

/**
 * @param {any} raw
 */
export function mapAnilistMedia(raw) {
    const score = typeof raw?.averageScore === 'number'
        ? Number((raw.averageScore / 10).toFixed(1))
        : 0;

    const cleanSynopsis = decodeBasicEntities(stripHtml(raw?.description || ''));

    return {
        id: raw?.id,
        title: raw?.title?.english || raw?.title?.romaji || raw?.title?.native || 'Sem título',
        synopsis: cleanSynopsis,
        posterUrl: raw?.coverImage?.large || raw?.coverImage?.extraLarge || '',
        score,
        genres: Array.isArray(raw?.genres) ? raw.genres : [],
        releaseYear: raw?.startDate?.year ?? null,
        releaseMonth: raw?.startDate?.month ?? null,
        bannerUrl: raw?.bannerImage || null,
        status: raw?.status || null,
        format: raw?.format || null,
        episodes: raw?.episodes ?? null
    };
}

/**
 * @param {any} pageData
 */
export function mapAnilistPageToSearchResult(pageData) {
    const media = Array.isArray(pageData?.media) ? pageData.media : [];

    return {
        items: media.map(mapAnilistMedia),
        totalPages: pageData?.pageInfo?.lastPage || 0,
        currentPage: pageData?.pageInfo?.currentPage || 1,
        totalResults: pageData?.pageInfo?.total || 0
    };
}
