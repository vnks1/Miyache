import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimeSection from '../components/AnimeSection';
import { userAnimeService } from '../services/api';

function ProfilePage() {
    const [watchedAnimes, setWatchedAnimes] = useState([]);
    const [watchLaterAnimes, setWatchLaterAnimes] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                setLoading(true);
                const animesRes = await userAnimeService.getAnimes();
                if (animesRes.success) {
                    setWatchedAnimes(formatAnimes(animesRes.data.watched));
                    setWatchLaterAnimes(formatAnimes(animesRes.data.watchLater));
                }

                const recsRes = await userAnimeService.getRecommendations();
                if (recsRes.success) {
                    setRecommendations(formatAnimes(recsRes.data));
                }
            } catch (error) {
                console.error('Error loading profile data:', error);
                setErrorMsg('Não foi possível carregar os dados do perfil.');
            } finally {
                setLoading(false);
            }
        };

        const token = localStorage.getItem('token');
        if (token) {
            loadProfileData();
        } else {
            setLoading(false);
            setErrorMsg('Você precisa estar logado para ver seu perfil.');
        }
    }, []);

    const formatAnimes = (animes) => {
        return animes.map(show => {
            let genre = 'Anime';
            if (show.source === 'anilist' && Array.isArray(show.genres) && show.genres.length > 0) {
                genre = show.genres[0];
            } else if (show.genresJson) {
                try {
                    const parsed = JSON.parse(show.genresJson);
                    if (parsed && parsed.length > 0) genre = parsed[0];
                } catch (e) {
                    // ignore
                }
            }

            return {
                id: show.tmdbId || show.anilistId || show.id,
                source: show.source || 'tmdb',
                title: show.title || show.titleOverride,
                image: show.posterUrl || (show.posterPath ? `https://image.tmdb.org/t/p/w500${show.posterPath}` : null),
                year: show.releaseDate ? new Date(show.releaseDate).getFullYear() : (show.releaseYear || 'N/A'),
                genre: genre,
                rating: typeof show.rating === 'number'
                    ? show.rating.toFixed(1)
                    : typeof show.score === 'number'
                        ? show.score.toFixed(1)
                        : 'N/A'
            };
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header isLoggedIn={true} />
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
                    <p className="text-lg text-white/70">Carregando...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header isLoggedIn={true} />

            <main className="flex-grow pt-[100px] px-4 md:px-6 lg:px-12 xl:px-20 max-w-[1440px] mx-auto w-full">
                <h1 className="text-3xl font-bold text-white mb-8">Meu Perfil</h1>

                {errorMsg && <div className="text-red-500 mb-6 font-semibold">{errorMsg}</div>}

                {!errorMsg && (
                    <>
                        {watchedAnimes.length > 0 ? (
                            <div className="mb-12">
                                <AnimeSection title="Assistidos" animes={watchedAnimes} />
                            </div>
                        ) : (
                            <div className="mb-12">
                                <h2 className="text-xl font-bold text-white mb-4">Assistidos</h2>
                                <p className="text-zinc-500 text-sm">Você ainda não marcou nenhum anime como assistido.</p>
                            </div>
                        )}

                        {watchLaterAnimes.length > 0 ? (
                            <div className="mb-12">
                                <AnimeSection title="Assistir Depois" animes={watchLaterAnimes} />
                            </div>
                        ) : (
                            <div className="mb-12">
                                <h2 className="text-xl font-bold text-white mb-4">Assistir Depois</h2>
                                <p className="text-zinc-500 text-sm">Sua lista para assistir depois está vazia.</p>
                            </div>
                        )}

                        {recommendations.length > 0 && (
                            <div className="mt-8 border-t border-zinc-800 pt-8">
                                <AnimeSection title="Recomendados para Você" animes={recommendations} />
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default ProfilePage;
