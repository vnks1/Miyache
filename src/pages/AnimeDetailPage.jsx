import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import AnimeHero from '../components/AnimeHero';
import SeasonSelector from '../components/SeasonSelector';
import EpisodeGrid from '../components/EpisodeGrid';
import AnimeSection from '../components/AnimeSection';
import Footer from '../components/Footer';
import {
    getShowDetails,
    getShowDetailsByTitle,
    getSeasonDetails,
    getRecommendedAnimeByGenres,
    getPosterUrl
} from '../services/tmdb';

function AnimeDetailPage() {
    const { id } = useParams();
    const location = useLocation();
    const [animeDetails, setAnimeDetails] = useState(null);
    const [activeShowId, setActiveShowId] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [seasonData, setSeasonData] = useState(null);
    const [similarAnimes, setSimilarAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn] = useState(true);

    useEffect(() => {
        const loadAnimeData = async () => {
            setLoading(true);
            setAnimeDetails(null);
            setSeasonData(null);
            setSimilarAnimes([]);

            try {
                const normalizedId = typeof id === 'string' ? id.trim() : '';
                const isNumericId = /^\d+$/.test(normalizedId);
                const stateTitle = location.state?.title || null;
                let decodedTitle = null;

                if (!isNumericId && normalizedId) {
                    try {
                        decodedTitle = decodeURIComponent(normalizedId);
                    } catch {
                        decodedTitle = normalizedId;
                    }
                }

                const fallbackTitle = stateTitle || decodedTitle;

                let details = null;

                // 1) Fluxo legado TMDB por ID numérico
                if (isNumericId) {
                    details = await getShowDetails(normalizedId);
                }

                // 2) Fallback TMDB por título
                if (!details && fallbackTitle) {
                    details = await getShowDetailsByTitle(fallbackTitle);
                }

                if (details) {
                    setAnimeDetails(details);
                    setActiveShowId(details.id);

                    if (details.seasons && details.seasons.length > 0) {
                        const firstNonSpecialSeason = details.seasons.find((s) => s.season_number > 0);
                        if (firstNonSpecialSeason) {
                            setSelectedSeason(firstNonSpecialSeason.season_number);
                        }
                    }

                    const genreIds = details.genres ? details.genres.map((g) => g.id) : [];
                    const similar = await getRecommendedAnimeByGenres(genreIds, details.id);
                    const formattedSimilar = similar.slice(0, 4).map((show) => ({
                        id: show.id,
                        title: show.name,
                        image: show.poster_path ? getPosterUrl(show.poster_path) : null,
                        year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A',
                        genre: show.genre_ids?.[0] || 'Anime',
                        rating: show.vote_average ? show.vote_average.toFixed(1) : 'N/A'
                    }));
                    setSimilarAnimes(formattedSimilar);
                } else {
                    setActiveShowId(null);
                }
            } catch (error) {
                console.error('Error loading anime data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAnimeData();
    }, [id, location.state]);

    useEffect(() => {
        const loadSeasonData = async () => {
            if (!animeDetails || !activeShowId) return;

            try {
                const season = await getSeasonDetails(activeShowId, selectedSeason);
                setSeasonData(season);
            } catch (error) {
                console.error('Error loading season data:', error);
            }
        };

        loadSeasonData();
    }, [activeShowId, selectedSeason, animeDetails]);

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header isLoggedIn={isLoggedIn} />
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
                    <p className="text-lg text-white/70">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!animeDetails) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header isLoggedIn={isLoggedIn} />
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
                    <h2 className="text-[32px] mb-4">Anime não encontrado</h2>
                    <p className="text-base text-white/70">Não foi possível carregar as informações deste anime.</p>
                </div>
            </div>
        );
    }

    const regularSeasons = animeDetails.seasons?.filter((s) => s.season_number > 0) || [];
    const displayEpisodes = seasonData?.episodes || [];

    return (
        <div className="flex flex-col min-h-screen">
            <Header isLoggedIn={isLoggedIn} />

            <main className="flex-grow">
                <AnimeHero anime={animeDetails} />

                <section className="my-[60px] mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12 xl:px-20">
                    <div className="flex justify-between items-center mb-4 max-md:flex-col max-md:items-start max-md:gap-4">
                        <h2 className="text-xl font-bold text-white">Episódios</h2>
                        {regularSeasons.length >= 1 && (
                            <SeasonSelector
                                seasons={regularSeasons}
                                selectedSeason={selectedSeason}
                                onSeasonChange={setSelectedSeason}
                            />
                        )}
                    </div>

                    {displayEpisodes.length > 0 && (
                        <EpisodeGrid
                            episodes={displayEpisodes}
                            animeName={animeDetails.name}
                            showId={animeDetails.id}
                        />
                    )}
                </section>

                {similarAnimes.length > 0 && (
                    <section className="my-[60px] mx-auto max-w-[1440px] px-4 md:px-6 lg:px-12 xl:px-20">
                        <AnimeSection
                            title="Você pode gostar"
                            animes={similarAnimes}
                        />
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default AnimeDetailPage;
