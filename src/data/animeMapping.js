// Mapping of local anime titles to TMDB TV show IDs
export const animeToTmdbId = {
    'Bleach TYWB': 30984,
    'Fullmetal Alchemist: Brotherhood': 5114,
    'Jujutsu Kaisen': 95479,
    'Demon Slayer': 85937,
    'Attack on Titan': 1429,
    'Solo Leveling': 209085,
    'Tower of God': 95557,
    'Spy x Family': 202250,
    'Chainsaw Man': 114410,
    'Bleach': 30984,
    'One Piece': 37854,
    'Naruto Shippuden': 31910,
    'Cowboy Bebop': 1396,
    'Death Note': 13916,
    'Steins;Gate': 40046,
    'Mob Psycho 100': 67133,
    'Frieren': 209867,
    'Oshi no Ko': 211112,
    'Mushoku Tensei': 115036,
    'Vinland Saga': 90462
};

/**
 * Get TMDB ID for an anime by title
 * @param {string} title - Anime title
 * @returns {number|null} - TMDB ID or null if not found
 */
export function getTmdbIdByTitle(title) {
    return animeToTmdbId[title] || null;
}
