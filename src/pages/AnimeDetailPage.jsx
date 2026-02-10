import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import AnimeHero from '../components/AnimeHero';
import SeasonSelector from '../components/SeasonSelector';
import EpisodeGrid from '../components/EpisodeGrid';
import AnimeSection from '../components/AnimeSection';
import Footer from '../components/Footer';
import { getShowDetails, getSeasonDetails, getSimilarShows, getPosterUrl } from '../services/tmdb';
import './AnimeDetailPage.css';

function AnimeDetailPage() {
    const { id } = useParams();
    const [animeDetails, setAnimeDetails] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [seasonData, setSeasonData] = useState(null);
    const [similarAnimes, setSimilarAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn] = useState(true);

    useEffect(() => {
        const loadAnimeData = async () => {
            setLoading(true);
            try {
                // Fetch anime details
                const details = await getShowDetails(id);
                if (details) {
                    setAnimeDetails(details);

                    // Set default season to the first available
                    if (details.seasons && details.seasons.length > 0) {
                        const firstNonSpecialSeason = details.seasons.find(s => s.season_number > 0);
                        if (firstNonSpecialSeason) {
                            setSelectedSeason(firstNonSpecialSeason.season_number);
                        }
                    }

                    // Fetch similar shows
                    const similar = await getSimilarShows(id);
                    const formattedSimilar = similar.slice(0, 4).map(show => ({
                        id: show.id,
                        title: show.name,
                        image: show.poster_path ? getPosterUrl(show.poster_path) : null,
                        year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A',
                        genre: show.genre_ids?.[0] || 'Anime',
                        rating: show.vote_average ? show.vote_average.toFixed(1) : 'N/A'
                    }));
                    setSimilarAnimes(formattedSimilar);
                }
            } catch (error) {
                console.error('Error loading anime data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAnimeData();
    }, [id]);

    useEffect(() => {
        const loadSeasonData = async () => {
            if (!animeDetails) return;

            try {
                const season = await getSeasonDetails(id, selectedSeason);
                setSeasonData(season);
            } catch (error) {
                console.error('Error loading season data:', error);
            }
        };

        loadSeasonData();
    }, [id, selectedSeason, animeDetails]);

    if (loading) {
        return (
            <div className="app">
                <Header isLoggedIn={isLoggedIn} />
                <div className="loading-container">
                    <p>Carregando...</p>
                </div>
            </div>
        );
    }

    if (!animeDetails) {
        return (
            <div className="app">
                <Header isLoggedIn={isLoggedIn} />
                <div className="error-container">
                    <h2>Anime não encontrado</h2>
                    <p>Não foi possível carregar as informações deste anime.</p>
                </div>
            </div>
        );
    }

    // Filter out special seasons (season 0)
    const regularSeasons = animeDetails.seasons?.filter(s => s.season_number > 0) || [];

    return (
        <div className="app">
            <Header isLoggedIn={isLoggedIn} />

            <main className="main-content">
                <AnimeHero anime={animeDetails} />

                <section className="episodes-section container">
                    <div className="episodes-header">
                        <h2 className="section-title">Episódios</h2>
                        {regularSeasons.length > 1 && (
                            <SeasonSelector
                                seasons={regularSeasons}
                                selectedSeason={selectedSeason}
                                onSeasonChange={setSelectedSeason}
                            />
                        )}
                    </div>

                    {seasonData && (
                        <EpisodeGrid
                            episodes={seasonData.episodes || []}
                            animeName={animeDetails.name}
                        />
                    )}
                </section>

                {similarAnimes.length > 0 && (
                    <AnimeSection
                        title="Você pode gostar"
                        animes={similarAnimes}
                    />
                )}
            </main>

            <Footer />
        </div>
    );
}

export default AnimeDetailPage;
