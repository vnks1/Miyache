const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Cache for search results and anime validation
const searchCache = new Map();
const animeValidationCache = new Map();
const detailsCache = new Map();

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
            `${BASE_URL}/tv/${showId}?api_key=${API_KEY}&language=pt-BR&append_to_response=keywords`,
            {
                headers: {
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
 * Get episode details by show ID, season, and episode number
 * @param {number} showId - TMDB show ID
 * @param {number} seasonNumber - Season number
 * @param {number} episodeNumber - Episode number
 * @returns {Promise<Object|null>} - Episode details or null
 */
export async function getEpisodeDetailsByShow(showId, seasonNumber, episodeNumber) {
    try {
        const url = `${BASE_URL}/tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits`;
        console.log('Fetching episode with URL:', url);

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(`Episode fetch response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP error response:`, errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Episode data received:', data);
        return data;
    } catch (error) {
        console.error(
            `Error fetching episode S${seasonNumber}E${episodeNumber} for show ${showId}:`,
            error
        );
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

/**
 * Validate if a TV show is actually an anime
 * Checks for anime keywords (210024), genres, and naming patterns
 * @param {Object} tvShow - TV show object from TMDB
 * @returns {boolean} - True if show appears to be an anime
 */
export function validateIsAnime(tvShow) {
    if (!tvShow) return false;

    // Check cache first
    const cacheKey = tvShow.id;
    if (animeValidationCache.has(cacheKey)) {
        return animeValidationCache.get(cacheKey);
    }

    let isAnime = false;

    // Check 1: Look for anime keyword (210024)
    if (tvShow.keywords?.results) {
        isAnime = tvShow.keywords.results.some(k => k.id === 210024);
        if (isAnime) {
            animeValidationCache.set(cacheKey, true);
            return true;
        }
    }

    // Check 2: Check origin country (Japan is common for anime)
    if (tvShow.origin_country?.includes('JP')) {
        isAnime = true;
    }

    // Check 3: Check genres (Animation is common for anime)
    const genreIds = tvShow.genre_ids || [];
    const animationGenreId = 16; // TMDB animation genre ID
    if (genreIds.includes(animationGenreId)) {
        isAnime = true;
    }

    animeValidationCache.set(cacheKey, isAnime);
    return isAnime;
}

/**
 * Search for anime by title with dynamic results
 * Returns multiple results, all validated as anime
 * @param {string} query - The anime title to search for
 * @returns {Promise<Array>} - Array of anime objects with details
 */
export async function searchAnimeByTitle(query) {
    try {
        // Check cache
        const cacheKey = `anime_${query.toLowerCase()}`;
        if (searchCache.has(cacheKey)) {
            return searchCache.get(cacheKey);
        }

        const response = await fetch(
            `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&page=1`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let results = data.results || [];

        // For better accuracy, fetch detailed info with keywords for each result
        const detailedResults = await Promise.all(
            results.slice(0, 10).map(async (show) => {
                const details = await getShowDetails(show.id);
                return details || show;
            })
        );

        // Filter only anime
        const animeResults = detailedResults.filter(show => validateIsAnime(show));

        // Cache the results
        searchCache.set(cacheKey, animeResults);

        return animeResults;
    } catch (error) {
        console.error(`Error searching for anime "${query}":`, error);
        return [];
    }
}

/**
 * Get TV show details by title, with anime-first matching
 * @param {string} title - Show title
 * @returns {Promise<Object|null>} - Show details or null
 */
export async function getShowDetailsByTitle(title) {
    if (!title || !title.trim()) return null;

    const normalizedTitle = title.trim();

    try {
        const fallbackShow = await searchShow(normalizedTitle);
        if (!fallbackShow?.id) return null;

        const details = await getShowDetails(fallbackShow.id);
        return details || fallbackShow;
    } catch (error) {
        console.error(`Error fetching show details by title "${title}":`, error);
        return null;
    }
}

/**
 * Clear search cache (useful for refreshing data)
 * @param {string} query - Optional: specific query to clear. If not provided, clears all
 */
export function clearSearchCache(query = null) {
    if (query) {
        const cacheKey = `anime_${query.toLowerCase()}`;
        searchCache.delete(cacheKey);
    } else {
        searchCache.clear();
    }
}

/**
 * Get popular anime series with pagination
 * @param {number} page - Page number to fetch
 * @returns {Promise<Object>} - Object containing results and pagination info
 */
export async function getPopularAnimeSeries(page = 1) {
    try {
        const response = await fetch(
            `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&with_genres=16&with_original_language=ja&page=${page}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Map to AnimeCard format
        const results = data.results.map(show => ({
            id: show.id,
            title: show.name || show.original_name,
            searchTitle: show.original_name,
            image: getPosterUrl(show.poster_path) || 'https://via.placeholder.com/500x750/1a1a2e/ffffff?text=Sem+Imagem',
            backdropImage: getBackdropUrl(show.backdrop_path),
            year: show.first_air_date ? show.first_air_date.substring(0, 4) : 'N/A',
            rating: show.vote_average ? show.vote_average.toFixed(1) : null,
            genre: 'Anime'
        }));

        return {
            results,
            page: data.page,
            totalPages: data.total_pages,
            totalResults: data.total_results
        };
    } catch (error) {
        console.error(`Error fetching popular anime page ${page}:`, error);
        return { results: [], page, totalPages: 0 };
    }
}

function mapShowToAnimeCard(show) {
    return {
        id: show.id,
        title: show.name || show.original_name,
        searchTitle: show.original_name,
        image: getPosterUrl(show.poster_path) || 'https://via.placeholder.com/500x750/1a1a2e/ffffff?text=Sem+Imagem',
        backdropImage: getBackdropUrl(show.backdrop_path),
        year: show.first_air_date ? show.first_air_date.substring(0, 4) : 'N/A',
        rating: show.vote_average ? show.vote_average.toFixed(1) : null,
        genre: 'Anime',
        genreIds: show.genre_ids || [],
        firstAirDate: show.first_air_date || null
    };
}

export async function getAnimeGenres() {
    try {
        const response = await fetch(
            `${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=pt-BR`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const genres = data.genres || [];

        // "Animacao" (id 16) is already implicit for anime results.
        return genres.filter(genre => genre.id !== 16);
    } catch (error) {
        console.error('Error fetching anime genres:', error);
        return [];
    }
}

export async function getFilteredAnimeSeries({
    page = 1,
    query = '',
    genreId = 'all',
    year = 'all',
    season = 'all',
    format = 'all',
    status = 'all'
} = {}) {
    try {
        const normalizedQuery = query.trim();
        const hasQuery = normalizedQuery.length > 0;
        const hasGenre = genreId !== 'all';
        const hasYear = year !== 'all';
        const hasSeason = season !== 'all';
        const hasFormat = format !== 'all';
        const hasStatus = status !== 'all';

        let url;
        if (hasQuery) {
            url = `${BASE_URL}/search/tv?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(normalizedQuery)}&page=${page}`;
        } else {
            const discoverParams = new URLSearchParams({
                api_key: API_KEY,
                language: 'pt-BR',
                sort_by: 'popularity.desc',
                with_original_language: 'ja',
                page: String(page)
            });

            discoverParams.set('with_genres', hasGenre ? `16,${genreId}` : '16');
            if (hasYear) {
                discoverParams.set('first_air_date_year', year);
            }
            if (hasStatus) {
                const statusParamMap = {
                    airing: '0',
                    finished: '3|4',
                    upcoming: '1|2|5'
                };
                const statusParam = statusParamMap[status];
                if (statusParam) {
                    discoverParams.set('with_status', statusParam);
                }
            }

            url = `${BASE_URL}/discover/tv?${discoverParams.toString()}`;
        }

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let results = data.results || [];

        const seasonByMonth = {
            winter: [12, 1, 2],
            spring: [3, 4, 5],
            summer: [6, 7, 8],
            fall: [9, 10, 11]
        };
        const inferSeason = (firstAirDate) => {
            if (!firstAirDate) return null;
            const month = new Date(firstAirDate).getMonth() + 1;
            if (seasonByMonth.winter.includes(month)) return 'winter';
            if (seasonByMonth.spring.includes(month)) return 'spring';
            if (seasonByMonth.summer.includes(month)) return 'summer';
            return 'fall';
        };
        const inferFormat = (show) => {
            const text = `${show.name || ''} ${show.original_name || ''}`.toLowerCase();
            if (text.includes(' ova')) return 'ova';
            if (text.includes(' ona')) return 'ona';
            if (text.includes('movie') || text.includes('filme') || text.includes('gekijouban')) return 'movie';
            return 'tv';
        };
        const mapStatusFromDetail = (statusLabel) => {
            if (!statusLabel) return null;
            const normalized = statusLabel.toLowerCase();
            if (normalized.includes('returning')) return 'airing';
            if (normalized.includes('ended') || normalized.includes('canceled')) return 'finished';
            if (
                normalized.includes('planned') ||
                normalized.includes('production') ||
                normalized.includes('pilot')
            ) {
                return 'upcoming';
            }
            return null;
        };

        if (hasQuery) {
            results = results.filter(show => {
                const isAnimeLike = show.original_language === 'ja' || (show.genre_ids || []).includes(16);
                if (!isAnimeLike) return false;
                if (hasGenre && !(show.genre_ids || []).includes(Number(genreId))) return false;
                if (hasYear) {
                    const firstAirDate = show.first_air_date || '';
                    if (!firstAirDate.startsWith(String(year))) return false;
                }
                return true;
            });
        }

        if (hasSeason) {
            results = results.filter(show => inferSeason(show.first_air_date) === season);
        }

        if (hasFormat) {
            results = results.filter(show => inferFormat(show) === format);
        }

        if (hasStatus && hasQuery) {
            const withStatus = await Promise.all(
                results.map(async (show) => {
                    if (!detailsCache.has(show.id)) {
                        detailsCache.set(show.id, getShowDetails(show.id));
                    }
                    const details = await detailsCache.get(show.id);
                    const normalizedStatus = mapStatusFromDetail(details?.status);
                    return normalizedStatus === status ? show : null;
                })
            );
            results = withStatus.filter(Boolean);
        }

        return {
            results: results.map(mapShowToAnimeCard),
            page: data.page,
            totalPages: data.total_pages,
            totalResults: data.total_results
        };
    } catch (error) {
        console.error('Error fetching filtered anime:', error);
        return { results: [], page, totalPages: 0, totalResults: 0 };
    }
}

/**
 * Get trending anime series with pagination
 * @param {number} page - Page number to fetch
 */
export async function getTrendingAnimeSeries(page = 1) {
    try {
        // We use discover to get trending/popular right now filtered by anime
        // Alternatively, /trending/tv/week with genre filter is harder, so we sort by trending metrics.
        // Actually, discover with sort_by=popularity.desc and a recent date is often best for "trending anime".
        // Let's use discover, sort by popularity, limited to last 6 months.
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const dateStr = sixMonthsAgo.toISOString().split('T')[0];
        
        const response = await fetch(
            `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&with_genres=16&with_original_language=ja&first_air_date.gte=${dateStr}&page=${page}`,
            { headers: { 'Content-Type': 'application/json' } }
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        const results = data.results.map(show => ({
            id: show.id,
            title: show.name || show.original_name,
            searchTitle: show.original_name,
            image: getPosterUrl(show.poster_path) || 'https://via.placeholder.com/500x750/1a1a2e/ffffff?text=Sem+Imagem',
            backdropImage: getBackdropUrl(show.backdrop_path),
            year: show.first_air_date ? show.first_air_date.substring(0, 4) : 'N/A',
            rating: show.vote_average ? show.vote_average.toFixed(1) : null,
            genre: 'Anime'
        }));

        return { results, page: data.page, totalPages: data.total_pages, totalResults: data.total_results };
    } catch (error) {
        console.error(`Error fetching trending anime page ${page}:`, error);
        return { results: [], page, totalPages: 0 };
    }
}

/**
 * Get currently airing/season anime series with pagination
 */
export async function getAiringAnimeSeries(page = 1) {
    try {
        const response = await fetch(
            `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&with_genres=16&with_original_language=ja&with_status=0|4&page=${page}`,
            { headers: { 'Content-Type': 'application/json' } }
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        const results = data.results.map(show => ({
            id: show.id,
            title: show.name || show.original_name,
            searchTitle: show.original_name,
            image: getPosterUrl(show.poster_path) || 'https://via.placeholder.com/500x750/1a1a2e/ffffff?text=Sem+Imagem',
            backdropImage: getBackdropUrl(show.backdrop_path),
            year: show.first_air_date ? show.first_air_date.substring(0, 4) : 'N/A',
            rating: show.vote_average ? show.vote_average.toFixed(1) : null,
            genre: 'Anime'
        }));

        return { results, page: data.page, totalPages: data.total_pages, totalResults: data.total_results };
    } catch (error) {
        console.error(`Error fetching airing anime page ${page}:`, error);
        return { results: [], page, totalPages: 0 };
    }
}

/**
 * Get top rated anime series with pagination
 */
export async function getTopRatedAnimeSeries(page = 1) {
    try {
        const response = await fetch(
            `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=pt-BR&sort_by=vote_average.desc&vote_count.gte=200&with_genres=16&with_original_language=ja&page=${page}`,
            { headers: { 'Content-Type': 'application/json' } }
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        const results = data.results.map(show => ({
            id: show.id,
            title: show.name || show.original_name,
            searchTitle: show.original_name,
            image: getPosterUrl(show.poster_path) || 'https://via.placeholder.com/500x750/1a1a2e/ffffff?text=Sem+Imagem',
            backdropImage: getBackdropUrl(show.backdrop_path),
            year: show.first_air_date ? show.first_air_date.substring(0, 4) : 'N/A',
            rating: show.vote_average ? show.vote_average.toFixed(1) : null,
            genre: 'Anime'
        }));

        return { results, page: data.page, totalPages: data.total_pages, totalResults: data.total_results };
    } catch (error) {
        console.error(`Error fetching top rated anime page ${page}:`, error);
        return { results: [], page, totalPages: 0 };
    }
}

/**
 * Get recommended popular anime series based on specific genres
 * @param {Array<number>} genreIds - Array of genre IDs
 * @param {number|null} currentShowId - ID of the current show to exclude from results
 * @returns {Promise<Array>} - List of recommended shows
 */
export async function getRecommendedAnimeByGenres(genreIds, currentShowId = null) {
    try {
        // Filter out the animation genre (16) if present, as it's implied
        const specificGenres = genreIds.filter(id => id !== 16);
        
        // Use 1 main genre for broad but accurate matching.
        const mainGenre = specificGenres.length > 0 ? specificGenres[0] : null;
        
        // Combine 16 (Animation) AND the main genre
        const genresParam = mainGenre ? `16,${mainGenre}` : '16';
        
        const response = await fetch(
            `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&with_genres=${genresParam}&with_original_language=ja&page=1`,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Filter out the current show
        let results = data.results || [];
        if (currentShowId) {
            results = results.filter(show => show.id !== currentShowId);
        }
        
        return results;
    } catch (error) {
        console.error(`Error fetching recommended anime by genres:`, error);
        return [];
    }
}

