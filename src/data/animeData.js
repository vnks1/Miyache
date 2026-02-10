import { getShowImages } from '../services/tmdb';
import acaoImg from '../assets/ação.png';
import dramaImg from '../assets/drama.png';
import aventuraImg from '../assets/aventura.png';
import isekaiImg from '../assets/isekai.png';

// Placeholder image while loading
const placeholderImage = 'https://via.placeholder.com/500x750/1a1a2e/ffffff?text=Loading...';

// Cache to store fetched images
const imageCache = new Map();

/**
 * Get anime images from TMDB API with caching
 * @param {string} title - The anime title to search for
 * @returns {Promise<Object>} - Object with image URLs
 */
async function fetchAnimeImages(title) {
    // Check cache first
    if (imageCache.has(title)) {
        return imageCache.get(title);
    }

    // Fetch from API
    const images = await getShowImages(title);

    // Cache the result
    imageCache.set(title, images);

    return images;
}

// Featured anime
export const featuredAnime = {
    id: 1,
    title: 'Bleach TYWB',
    description: 'A trama segue o ceifador de almas substituto Ichigo Kurosaki, encarregado de exorcizar Hollows, espíritos malignos que atacam os pessoas.',
    backdropImage: placeholderImage,
    image: placeholderImage,
    year: '2022',
    genre: 'Ação',
    rating: '4.9'
};

// Trending animes
export const trendingAnimes = [
    {
        id: 2,
        title: 'FMA: Brotherhood',
        searchTitle: 'Fullmetal Alchemist: Brotherhood',
        image: 'https://www.themoviedb.org/t/p/w600_and_h900_face/5ZFUEOULaVml7pQuXxhpR2SmVUw.jpg',
        year: '2009',
        genre: 'Ação',
        rating: '4.3'
    },
    {
        id: 3,
        title: 'Jujutsu Kaisen',
        image: placeholderImage,
        year: '2020',
        genre: 'Ação',
        rating: '4.5'
    },
    {
        id: 4,
        title: 'Demon Slayer',
        image: placeholderImage,
        year: '2019',
        genre: 'Ação',
        rating: '4.7'
    },
    {
        id: 5,
        title: 'Attack on Titan',
        image: placeholderImage,
        year: '2013',
        genre: 'Drama',
        rating: '4.8'
    }
];

// Popular animes
export const popularAnimes = [
    {
        id: 6,
        title: 'Solo Leveling',
        image: placeholderImage,
        year: '2024',
        genre: 'Ação',
        rating: '4.6'
    },
    {
        id: 7,
        title: 'Tower of God',
        image: placeholderImage,
        year: '2020',
        genre: 'Aventura',
        rating: '4.2'
    },
    {
        id: 8,
        title: 'Spy x Family',
        image: placeholderImage,
        year: '2022',
        genre: 'Comédia',
        rating: '4.4'
    },
    {
        id: 9,
        title: 'Chainsaw Man',
        image: placeholderImage,
        year: '2022',
        genre: 'Ação',
        rating: '4.3'
    }
];

// Continue watching
export const continueWatching = [
    {
        id: 10,
        title: 'Bleach',
        image: placeholderImage,
        year: '2022',
        episode: 'S4E03',
        progress: 65
    },
    {
        id: 11,
        title: 'One Piece',
        image: placeholderImage,
        year: '1999',
        episode: 'EP 1089',
        progress: 30
    },
    {
        id: 12,
        title: 'Naruto Shippuden',
        image: placeholderImage,
        year: '2007',
        episode: 'EP 450',
        progress: 80
    }
];

// My list
export const myList = [
    {
        id: 13,
        title: 'Cowboy Bebop',
        image: placeholderImage,
        year: '1998',
        genre: 'Sci-Fi',
        rating: '4.9'
    },
    {
        id: 14,
        title: 'Death Note',
        image: placeholderImage,
        year: '2006',
        genre: 'Thriller',
        rating: '4.8'
    },
    {
        id: 15,
        title: 'Steins;Gate',
        image: placeholderImage,
        year: '2011',
        genre: 'Sci-Fi',
        rating: '4.7'
    },
    {
        id: 16,
        title: 'Mob Psycho 100',
        image: placeholderImage,
        year: '2016',
        genre: 'Comédia',
        rating: '4.5'
    }
];

// Categories
export const categories = [
    {
        id: 1,
        name: 'Ação',
        image: acaoImg
    },
    {
        id: 2,
        name: 'Drama',
        image: dramaImg
    },
    {
        id: 3,
        name: 'Aventura',
        image: aventuraImg
    },
    {
        id: 4,
        name: 'Isekai',
        image: isekaiImg
    },
    {
        id: 5,
        name: 'Shounen',
        image: placeholderImage
    },
    {
        id: 6,
        name: 'Esportes',
        image: placeholderImage
    },
    {
        id: 7,
        name: 'Romance',
        image: placeholderImage
    },
    {
        id: 8,
        name: 'Comédia',
        image: placeholderImage
    }
];

// Seasonal animes
export const seasonalAnimes = [
    {
        id: 17,
        title: 'Frieren',
        image: placeholderImage,
        year: '2023',
        genre: 'Aventura',
        rating: '4.9'
    },
    {
        id: 18,
        title: 'Oshi no Ko',
        image: placeholderImage,
        year: '2023',
        genre: 'Drama',
        rating: '4.6'
    },
    {
        id: 19,
        title: 'Mushoku Tensei',
        image: placeholderImage,
        year: '2021',
        genre: 'Isekai',
        rating: '4.5'
    },
    {
        id: 20,
        title: 'Vinland Saga',
        image: placeholderImage,
        year: '2019',
        genre: 'Ação',
        rating: '4.8'
    }
];

/**
 * Load images from TMDB API for all animes
 * This should be called when the app initializes
 */
export async function loadAllAnimeImages() {
    const allAnimes = [
        featuredAnime,
        ...trendingAnimes,
        ...popularAnimes,
        ...continueWatching,
        ...myList,
        ...seasonalAnimes
    ];

    // Fetch images for all animes in parallel
    const promises = allAnimes.map(async (anime) => {
        // Use searchTitle if available, otherwise use title
        const searchQuery = anime.searchTitle || anime.title;
        const images = await fetchAnimeImages(searchQuery);
        if (images.posterUrl) {
            anime.image = images.posterUrl;
        }
        if (anime === featuredAnime && images.backdropUrl) {
            anime.backdropImage = images.backdropUrl;
        }
    });

    await Promise.all(promises);
}
