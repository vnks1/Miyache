import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import AnimeSection from '../components/AnimeSection';
import CategoryGrid from '../components/CategoryGrid';
import Footer from '../components/Footer';
import {
    featuredAnime,
    trendingAnimes,
    popularAnimes,
    categories,
    seasonalAnimes,
    loadAllAnimeImages
} from '../data/animeData';

function HomePage() {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [, forceUpdate] = useState({});

    useEffect(() => {
        // Load images from TMDB API
        const loadImages = async () => {
            try {
                await loadAllAnimeImages();
                setImagesLoaded(true);
                // Force re-render to show loaded images
                forceUpdate({});
            } catch (error) {
                console.error('Error loading anime images:', error);
                setImagesLoaded(true); // Still show the app with placeholder images
            }
        };

        loadImages();
    }, []);

    return (
        <>
            <Header isLoggedIn={isLoggedIn} />

            <main className="main-content">
                <Hero anime={featuredAnime} />

                <AnimeSection
                    title="Em alta"
                    animes={trendingAnimes}
                />

                <AnimeSection
                    title="Populares"
                    animes={popularAnimes}
                />

                <AnimeSection
                    title="Animes da temporada"
                    animes={seasonalAnimes}
                />

                <CategoryGrid categories={categories} />
            </main>

            <Footer />
        </>
    );
}

export default HomePage;
