const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const READ_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/**
 * Search for a TV show/anime by name
 * @param {string} query - The name of the anime/show to search for
 * @returns {Promise<Object|null>} - The first search result or null
 */
export async function searchShow(query) {
    try {
        const response = await fetch(
            `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR`,
            {
                headers: {
                    'Authorization': `Bearer ${READ_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.results && data.results.length > 0 ? data.results[0] : null;
    } catch (error) {
        console.error(`Error searching for show "${query}":`, error);
        return null;
    }
}

/**
 * Get the poster URL for a show
 * @param {string} posterPath - The poster path from TMDB
 * @param {string} size - Image size (w300, w500, original, etc.)
 * @returns {string|null} - Full URL to the poster image
 */
export function getPosterUrl(posterPath, size = 'w500') {
    if (!posterPath) return null;
    return `${IMAGE_BASE_URL}/${size}${posterPath}`;
}

/**
 * Get the backdrop URL for a show
 * @param {string} backdropPath - The backdrop path from TMDB
 * @param {string} size - Image size (w780, w1280, original, etc.)
 * @returns {string|null} - Full URL to the backdrop image
 */
export function getBackdropUrl(backdropPath, size = 'w1280') {
    if (!backdropPath) return null;
    return `${IMAGE_BASE_URL}/${size}${backdropPath}`;
}

/**
 * Search for a show and return the poster URL
 * @param {string} showName - The name of the show
 * @param {string} size - Image size for the poster
 * @returns {Promise<string|null>} - URL to the poster or null
 */
export async function getShowPosterUrl(showName, size = 'w500') {
    const show = await searchShow(showName);
    if (!show || !show.poster_path) return null;
    return getPosterUrl(show.poster_path, size);
}

/**
 * Search for a show and return both poster and backdrop URLs
 * @param {string} showName - The name of the show
 * @returns {Promise<Object>} - Object with posterUrl and backdropUrl
 */
export async function getShowImages(showName) {
    const show = await searchShow(showName);

    return {
        posterUrl: show?.poster_path ? getPosterUrl(show.poster_path) : null,
        backdropUrl: show?.backdrop_path ? getBackdropUrl(show.backdrop_path) : null,
        rating: show?.vote_average ? show.vote_average.toFixed(1) : null,
        overview: show?.overview || null
    };
}

/**
 * Get TV show details by ID
 * @param {number} showId - TMDB show ID
 * @returns {Promise<Object|null>} - Show details or null
 */
export async function getShowDetails(showId) {
    try {
        const response = await fetch(
            `${BASE_URL}/tv/${showId}?api_key=${API_KEY}&language=pt-BR`,
            {
                headers: {
                    'Authorization': `Bearer ${READ_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching show details for ID ${showId}:`, error);
        return null;
    }
}

/**
 * Get season details with episodes
 * @param {number} showId - TMDB show ID
 * @param {number} seasonNumber - Season number
 * @returns {Promise<Object|null>} - Season with episodes or null
 */
export async function getSeasonDetails(showId, seasonNumber) {
    try {
        const response = await fetch(
            `${BASE_URL}/tv/${showId}/season/${seasonNumber}?api_key=${API_KEY}&language=pt-BR`,
            {
                headers: {
                    'Authorization': `Bearer ${READ_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching season ${seasonNumber} for show ${showId}:`, error);
        return null;
    }
}

/**
 * Get similar/recommended shows
 * @param {number} showId - TMDB show ID
 * @returns {Promise<Array>} - List of similar shows
 */
export async function getSimilarShows(showId) {
    try {
        const response = await fetch(
            `${BASE_URL}/tv/${showId}/similar?api_key=${API_KEY}&language=pt-BR`,
            {
                headers: {
                    'Authorization': `Bearer ${READ_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error(`Error fetching similar shows for ID ${showId}:`, error);
        return [];
    }
}

/**
 * Get episode image URL
 * @param {string} stillPath - The still/thumbnail path from TMDB
 * @param {string} size - Image size (w300, w500, original, etc.)
 * @returns {string|null} - Full URL to the episode image
 */
export function getStillUrl(stillPath, size = 'w300') {
    if (!stillPath) return null;
    return `${IMAGE_BASE_URL}/${size}${stillPath}`;
}

