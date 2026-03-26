import { useState } from 'react';
import Badge from './Badge';
import { userAnimeService } from '../services/api';

function AnimeHero({ anime }) {
    const [loadingAction, setLoadingAction] = useState(false);

    const title = anime.name || anime.title || 'Sem título';
    const synopsis = anime.overview || anime.synopsis || '';
    const backdropImage = anime.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${anime.backdrop_path}`
        : anime.bannerUrl
            ? anime.bannerUrl
            : 'https://via.placeholder.com/1280x720/1a1a2e/ffffff?text=Backdrop';

    const posterImage = anime.poster_path
        ? `https://image.tmdb.org/t/p/w500${anime.poster_path}`
        : anime.posterUrl
            ? anime.posterUrl
            : 'https://via.placeholder.com/500x750/1a1a2e/ffffff?text=Poster';

    const rating = typeof anime.vote_average === 'number'
        ? anime.vote_average.toFixed(1)
        : typeof anime.score === 'number'
            ? anime.score.toFixed(1)
            : 'N/A';

    const year = anime.first_air_date
        ? new Date(anime.first_air_date).getFullYear()
        : anime.releaseYear || 'N/A';

    const normalizedStatus = anime.status || '';
    const isTmdbSource = anime.source !== 'anilist';

    const handleSaveAnime = async (status) => {
        try {
            setLoadingAction(true);
            if (isTmdbSource) {
                const tmdbId = anime.id;
                const animeTitle = anime.name || anime.title;
                const posterPath = anime.poster_path;
                const genresJson = JSON.stringify(anime.genres ? anime.genres.map((g) => g.name || g) : []);
                await userAnimeService.upsertAnime(tmdbId, animeTitle, status, posterPath, genresJson);
            } else {
                await userAnimeService.upsertAniListAnime(anime.id, title, status, {
                    synopsis,
                    posterUrl: anime.posterUrl || null,
                    bannerUrl: anime.bannerUrl || null,
                    score: typeof anime.score === 'number' ? anime.score : null,
                    genres: Array.isArray(anime.genres) ? anime.genres : []
                });
            }
            alert(status === 'watched' ? 'Marcado como assistido!' : 'Adicionado à lista para assistir depois!');
        } catch (error) {
            console.error('Error saving anime', error);
            if (error.response?.status === 401) {
                alert('Você precisa estar logado para salvar animes.');
            } else {
                alert('Erro ao salvar anime.');
            }
        } finally {
            setLoadingAction(false);
        }
    };

    return (
        <div className="relative w-full min-h-[620px] max-md:min-h-[460px] max-md:items-center flex items-end mb-[60px] pb-[60px] max-md:pb-[32px]">
            <div
                className="absolute top-0 left-0 w-full h-[75%] max-md:h-[60%] bg-cover bg-top bg-no-repeat z-0"
                style={{ backgroundImage: `url(${backdropImage})` }}
            >
                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.4)_50%,rgba(0,0,0,0.8)_100%),linear-gradient(to_bottom,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0.7)_60%,#0E0E0E_100%)]"></div>
            </div>

            <div className="relative z-10 flex gap-10 items-start w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 xl:px-20 pt-[100px] max-md:pt-[72px] max-md:flex-col max-md:items-center max-md:text-center">
                <div className="shrink-0 w-[340px] h-[453px] max-md:w-[200px] max-md:h-[266px] rounded-xl overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.6)]">
                    <img src={posterImage} alt={title} className="w-full h-full object-cover block" />
                </div>

                <div className="relative flex-1 flex flex-col justify-center pt-5 max-md:pb-0">
                    <div className="flex items-center gap-4 mb-4 max-md:flex-col max-md:gap-2">
                        <h1 className="text-[48px] max-md:text-[32px] font-extrabold text-white m-0 leading-[1.2]">{title}</h1>
                        <div className="flex items-center gap-1.5 text-[#FFD700] text-[20px] font-semibold">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <span>{rating}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap mb-6 max-md:justify-center">
                        {normalizedStatus && (
                            <Badge variant="primary">
                                {normalizedStatus === 'Returning Series' || normalizedStatus === 'RELEASING'
                                    ? 'Lançando'
                                    : 'Finalizado'}
                            </Badge>
                        )}
                        <Badge variant="outlined">{year}</Badge>
                        <Badge variant="outlined">Legendado | Dublado</Badge>
                    </div>

                    {synopsis && (
                        <p className="text-white/85 text-base leading-[1.6] m-0 mb-8 max-w-[650px] max-md:max-w-full">{synopsis}</p>
                    )}

                    <div className="flex gap-4 max-md:flex-col max-md:w-full">
                        <button
                            onClick={() => handleSaveAnime('watched')}
                            disabled={loadingAction}
                            className="flex items-center justify-center gap-2.5 py-3.5 px-8 border-none rounded-full text-base font-semibold cursor-pointer transition-all duration-300 max-md:w-full bg-green-500 text-white hover:bg-green-600 hover:-translate-y-[2px] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {loadingAction ? 'Salvando...' : 'Marcar Assistido'}
                        </button>
                        <button
                            onClick={() => handleSaveAnime('watchLater')}
                            disabled={loadingAction}
                            className="flex items-center justify-center gap-2.5 py-3.5 px-8 border-none rounded-full text-base font-semibold cursor-pointer transition-all duration-300 max-md:w-full bg-[#A30000] text-white hover:bg-[#8B0000] hover:-translate-y-[2px] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            {loadingAction ? 'Salvando...' : 'Assistir depois'}
                        </button>
                        <button className="w-[52px] h-[52px] shrink-0 flex items-center justify-center gap-2 bg-white rounded-full border-none cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-[0_4px_12px_rgba(255,255,255,0.3)] max-md:w-full max-md:rounded-full" aria-label="Compartilhar">
                            <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                            <span className="hidden max-md:inline text-sm font-semibold text-black">Compartilhar com amigos</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnimeHero;
