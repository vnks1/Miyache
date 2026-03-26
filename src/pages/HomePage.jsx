import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import AnimeSection from '../components/AnimeSection';
import Footer from '../components/Footer';
import { getRecommendations } from '../services/recommendationApi';
import { RecommendationRow } from '../components/RecommendationRow';
import { authService } from '../services/api.js';
import { getPopularMedia } from '../services/api/media.service';
import { ApiRequestError } from '../services/api/anilist/client';

function mapMediaToAnimeCard(media) {
    return {
        id: media.id,
        source: 'anilist',
        title: media.title,
        searchTitle: media.title,
        image: media.posterUrl || 'https://placehold.co/400x600/1e1e24/a0a0b0?text=Sem+Imagem',
        year: media.releaseYear ? String(media.releaseYear) : 'N/A',
        genre: media.genres?.[0] || 'Anime',
        rating: typeof media.score === 'number' ? media.score.toFixed(1) : null
    };
}

function mapMediaToHero(media) {
    return {
        title: media.title,
        description: media.synopsis || 'Sem descrição disponível.',
        image: media.bannerUrl || media.posterUrl || '',
        year: media.releaseYear ? String(media.releaseYear) : 'N/A',
        genre: media.genres?.[0] || 'Anime',
        rating: typeof media.score === 'number' ? media.score.toFixed(1) : 'N/A'
    };
}

const fallbackHero = {
    title: 'Descubra Novos Animes',
    description: 'Explore os títulos em destaque selecionados na AniList.',
    image: '',
    year: 'N/A',
    genre: 'Anime',
    rating: 'N/A'
};

function HomePage() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [recommended, setRecommended] = useState([]);
    const [becauseYouLiked, setBecauseYouLiked] = useState([]);

    const [featuredAnime, setFeaturedAnime] = useState(fallbackHero);
    const [trendingList, setTrendingList] = useState([]);
    const [popularList, setPopularList] = useState([]);
    const [seasonalList, setSeasonalList] = useState([]);
    const [homeError, setHomeError] = useState('');

    useEffect(() => {
        const handleStorageChange = () => {
            setIsLoggedIn(!!localStorage.getItem('token'));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        const loadRecommendations = async () => {
            if (!localStorage.getItem('token')) return;
            try {
                let nick = 'testUser';
                try {
                    const me = await authService.getMe();
                    if (me?.data?.email) nick = me.data.email;
                } catch {
                    // ignore
                }
                const data = await getRecommendations(nick);
                setRecommended(data?.recommendations || []);
                setBecauseYouLiked(data?.becauseYouLiked || []);
            } catch (error) {
                console.error('Error loading recommendations:', error);
            }
        };

        const loadHomeSections = async () => {
            setHomeError('');
            try {
                const [page1, page2] = await Promise.all([
                    getPopularMedia(1, 20),
                    getPopularMedia(2, 20)
                ]);

                const list1 = (page1?.items || []).map(mapMediaToAnimeCard);
                const list2 = (page2?.items || []).map(mapMediaToAnimeCard);

                if (list1.length > 0) {
                    setFeaturedAnime(mapMediaToHero(page1.items[0]));
                    setTrendingList(list1.slice(0, 4));
                    setPopularList(list1.slice(4, 8).length > 0 ? list1.slice(4, 8) : list1.slice(0, 4));
                    setSeasonalList(list2.slice(0, 4).length > 0 ? list2.slice(0, 4) : list1.slice(8, 12));
                }
            } catch (error) {
                console.error('Error loading AniList home sections:', error);
                if (error instanceof ApiRequestError && error.code === 'rate_limit') {
                    setHomeError('AniList temporariamente indisponível por limite de requisições.');
                } else {
                    setHomeError('Não foi possível atualizar a Home agora.');
                }
            }
        };

        loadRecommendations();
        loadHomeSections();
    }, [isLoggedIn]);

    return (
        <>
            <Header isLoggedIn={isLoggedIn} />

            <main className="flex-1 flex flex-col">
                <Hero anime={featuredAnime} />

                {becauseYouLiked.length > 0 && (
                    <RecommendationRow
                        title="Porque você assistiu..."
                        animes={becauseYouLiked}
                    />
                )}

                {recommended.length > 0 && (
                    <RecommendationRow
                        title="Recomendado para você"
                        animes={recommended}
                    />
                )}

                <AnimeSection title="Em alta" animes={trendingList} />
                <AnimeSection title="Populares" animes={popularList} />
                <AnimeSection title="Animes da temporada" animes={seasonalList} />

                {homeError && (
                    <p className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 xl:px-20 text-sm text-white/70 pb-8">
                        {homeError}
                    </p>
                )}
            </main>

            <Footer />
        </>
    );
}

export default HomePage;
