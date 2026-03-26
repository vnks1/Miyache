import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
    getEpisodeDetailsByShow,
    getBackdropUrl,
    getSeasonDetails,
    getShowDetails,
    getStillUrl
} from '../services/tmdb';
import { episodeProgressService } from '../services/api.js';

function parseEpisodeRouteKey(rawId) {
    if (!rawId) return null;

    let value = String(rawId);
    try {
        value = decodeURIComponent(value);
    } catch {
        value = String(rawId);
    }
    const tmdbMatch = value.match(/^tmdb-(\d+)-s(\d+)-e(\d+)$/i);
    if (tmdbMatch) {
        return {
            source: 'tmdb',
            showId: Number(tmdbMatch[1]),
            seasonNumber: Number(tmdbMatch[2]),
            episodeNumber: Number(tmdbMatch[3]),
            storageKey: value
        };
    }

    const numericValue = Number(value);
    if (Number.isInteger(numericValue) && numericValue > 0) {
        return {
            source: 'legacy-tmdb',
            legacyEpisodeId: numericValue,
            storageKey: value
        };
    }

    return {
        source: 'search',
        query: value,
        storageKey: value
    };
}

function buildEpisodeStorageKey(kind, episodeKey) {
    return `episode_${kind}_${episodeKey}`;
}

function buildTmdbEpisodeRouteKey(showId, seasonNumber, episodeNumber) {
    return `tmdb-${showId}-s${seasonNumber}-e${episodeNumber}`;
}

function readLocalEpisodeProgress(episodeKey) {
    try {
        const watchedKey = buildEpisodeStorageKey('watched', episodeKey);
        const ratingKey = buildEpisodeStorageKey('rating', episodeKey);

        return {
            watched: localStorage.getItem(watchedKey) === 'true',
            rating: Number(localStorage.getItem(ratingKey) || 0) || 0,
        };
    } catch {
        return { watched: false, rating: 0 };
    }
}

function writeLocalEpisodeProgress(episodeKey, watched, rating) {
    try {
        const watchedKey = buildEpisodeStorageKey('watched', episodeKey);
        const ratingKey = buildEpisodeStorageKey('rating', episodeKey);

        if (watched) {
            localStorage.setItem(watchedKey, 'true');
        } else {
            localStorage.removeItem(watchedKey);
        }

        if (rating > 0) {
            localStorage.setItem(ratingKey, String(rating));
        } else {
            localStorage.removeItem(ratingKey);
        }
    } catch {
        // Ignore storage failures and keep the page usable.
    }
}

function buildEpisodeProgressPayload({
    routeKey,
    episodeDetails,
    showDetails,
    watched,
    rating,
}) {
    const normalizedRating = rating > 0 ? rating : null;

    if (routeKey?.source === 'tmdb' && episodeDetails) {
        return {
            source: 'tmdb',
            tmdbShowId: routeKey.showId,
            seasonNumber: routeKey.seasonNumber,
            episodeNumber: routeKey.episodeNumber,
            animeTitle: showDetails?.name || 'Anime',
            episodeTitle: episodeDetails.name || null,
            overview: episodeDetails.overview || null,
            stillPath: episodeDetails.still_path || null,
            backdropPath: showDetails?.backdrop_path || null,
            watched,
            rating: normalizedRating,
        };
    }

    return null;
}

function getEpisodeDirector(episodeDetails) {
    const crew = episodeDetails?.credits?.crew || [];
    const director = crew.find((person) => person.job === 'Director');
    return director?.name || null;
}

function EpisodeDetailPage() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [episodeDetails, setEpisodeDetails] = useState(null);
    const [showDetails, setShowDetails] = useState(null);
    const [activeShowId, setActiveShowId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nextError, setNextError] = useState(null);
    const [isWatched, setIsWatched] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [nextLoading, setNextLoading] = useState(false);
    const [isLoggedIn] = useState(true);

    const routeKey = useMemo(() => parseEpisodeRouteKey(id), [id]);
    const episodeStorageKey = routeKey?.storageKey || String(id || '');
    let hasAuthToken = false;
    try {
        hasAuthToken = !!localStorage.getItem('token');
    } catch {
        hasAuthToken = false;
    }

    const persistEpisodeProgress = async (nextWatched, nextRating) => {
        if (!episodeStorageKey) return;

        writeLocalEpisodeProgress(episodeStorageKey, nextWatched, nextRating);

        if (!hasAuthToken) return;

        const payload = buildEpisodeProgressPayload({
            routeKey,
            episodeDetails,
            showDetails,
            watched: nextWatched,
            rating: nextRating,
        });

        if (!payload) return;

        try {
            await episodeProgressService.upsertProgress(episodeStorageKey, payload);
        } catch (progressError) {
            console.error('Error saving episode progress:', progressError);
        }
    };

    useEffect(() => {
        const loadEpisodeData = async () => {
            setLoading(true);
            setError(null);
            setNextError(null);
            setEpisodeDetails(null);
            setShowDetails(null);

            const loadPersistedEpisodeProgress = async () => {
                if (hasAuthToken && episodeStorageKey) {
                    try {
                        const progress = await episodeProgressService.getProgress(episodeStorageKey);
                        if (progress) {
                            setIsWatched(!!progress.watched);
                            setRating(progress.rating != null ? Number(progress.rating) : 0);
                            return;
                        }
                    } catch (progressError) {
                        console.error('Error loading episode progress from API:', progressError);
                    }
                }

                const localProgress = readLocalEpisodeProgress(episodeStorageKey);
                setIsWatched(localProgress.watched);
                setRating(localProgress.rating);
            };

            const stateShowId = location.state?.showId;
            const stateSeasonNumber = location.state?.seasonNumber;
            const stateEpisodeNumber = location.state?.episodeNumber;
            const tmdbShowId = Number.isFinite(stateShowId) ? stateShowId : routeKey?.showId || null;
            const tmdbSeasonNumber = Number.isFinite(stateSeasonNumber)
                ? stateSeasonNumber
                : routeKey?.seasonNumber || null;
            const tmdbEpisodeNumber = Number.isFinite(stateEpisodeNumber)
                ? stateEpisodeNumber
                : routeKey?.episodeNumber || null;

            try {
                if (tmdbShowId && Number.isFinite(tmdbSeasonNumber) && Number.isFinite(tmdbEpisodeNumber)) {
                    const episode = await getEpisodeDetailsByShow(
                        tmdbShowId,
                        tmdbSeasonNumber,
                        tmdbEpisodeNumber
                    );

                    if (!episode) {
                        setError('Episodio nao encontrado.');
                        return;
                    }

                    setEpisodeDetails(episode);
                    setActiveShowId(tmdbShowId);

                    const show = await getShowDetails(tmdbShowId);
                    setShowDetails(show);
                    await loadPersistedEpisodeProgress();
                    return;
                }

                if (routeKey?.source === 'legacy-tmdb') {
                    setError('Este link antigo precisa abrir um episodio TMDB com show, temporada e numero do episodio.');
                } else {
                    setError('Este link precisa ser aberto a partir de um episodio TMDB.');
                }
            } catch (err) {
                console.error('Error loading episode data:', err);
                setError('Nao foi possivel carregar o conteudo.');
            } finally {
                setLoading(false);
            }
        };

        loadEpisodeData();
    }, [episodeStorageKey, hasAuthToken, id, location.state, routeKey]);

    const handleMarkWatched = (nextValue = !isWatched) => {
        setIsWatched(nextValue);
        void persistEpisodeProgress(nextValue, rating);
    };

    const handleRating = (value) => {
        setRating(value);
        if (!isWatched) {
            setIsWatched(true);
        }
        void persistEpisodeProgress(true, value);
    };

    const handleNextEpisode = async () => {
        if (!episodeDetails || !activeShowId) return;

        setNextLoading(true);
        setNextError(null);
        const currentSeason = episodeDetails.season_number;
        const currentEpisode = episodeDetails.episode_number;

        try {
            let nextEpisode = null;
            const seasonData = await getSeasonDetails(activeShowId, currentSeason);

            if (seasonData?.episodes?.length) {
                nextEpisode = seasonData.episodes.find(
                    (episode) => episode.episode_number === currentEpisode + 1
                );
            }

            if (!nextEpisode) {
                const nextSeasonData = await getSeasonDetails(activeShowId, currentSeason + 1);
                if (nextSeasonData?.episodes?.length) {
                    nextEpisode = nextSeasonData.episodes.find(
                        (episode) => episode.episode_number === 1
                    );
                }
            }

            if (nextEpisode?.id) {
                navigate(
                    `/episode/${buildTmdbEpisodeRouteKey(activeShowId, nextEpisode.season_number, nextEpisode.episode_number)}`
                );
            } else {
                setNextError('Nao ha proximo episodio disponivel.');
            }
        } catch (err) {
            console.error('Error loading next episode:', err);
            setNextError('Nao foi possivel carregar o proximo episodio.');
        } finally {
            setNextLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header isLoggedIn={isLoggedIn} />
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
                    <p className="text-lg text-white/70">Carregando episodio...</p>
                </div>
            </div>
        );
    }

    if (!episodeDetails || error) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header isLoggedIn={isLoggedIn} />
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-white">
                    <h2 className="text-[32px] mb-4">Conteudo nao encontrado</h2>
                    <p className="text-base text-white/70">{error || 'Nao foi possivel carregar as informacoes.'}</p>
                </div>
            </div>
        );
    }

    const episodeTitle = `T${episodeDetails.season_number} E${String(episodeDetails.episode_number).padStart(2, '0')} - ${episodeDetails.name}`;
    const airDate = episodeDetails.air_date
        ? new Date(episodeDetails.air_date).toLocaleDateString('pt-BR')
        : 'Nao informado';
    const tmdbDisplayScore = episodeDetails.vote_average
        ? Number(episodeDetails.vote_average) / 2
        : 0;
    const tmdbFilledStars = Math.round(tmdbDisplayScore);
    const runtime = episodeDetails.runtime
        ? `${episodeDetails.runtime} min`
        : (showDetails?.episode_run_time?.[0] ? `${showDetails.episode_run_time[0]} min` : 'Nao informado');
    const backdropImage = showDetails?.backdrop_path
        ? getBackdropUrl(showDetails.backdrop_path, 'original')
        : null;
    const stillImage = episodeDetails.still_path
        ? getStillUrl(episodeDetails.still_path, 'w780')
        : 'https://via.placeholder.com/780x439/1a1a2e/ffffff?text=Episode';
    const starValue = hoverRating || rating;
    const episodeDirector = getEpisodeDirector(episodeDetails);

    return (
        <div className="flex flex-col min-h-screen">
            <Header isLoggedIn={isLoggedIn} />

            <main className="flex-grow">
                <section className="mt-24 md:mt-28 max-w-[1440px] px-4 md:px-6 lg:px-12 xl:px-20 mx-auto mb-20">
                    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#090909] shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
                        <div className="relative h-[220px] md:h-[280px]">
                            <img
                                src={backdropImage || stillImage}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.92)),linear-gradient(90deg,rgba(0,0,0,0.72),transparent_55%,rgba(0,0,0,0.45))]" />
                        </div>

                        <div className="relative px-5 md:px-8 lg:px-10 pb-8 md:pb-10 -mt-16">
                            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_410px] gap-8 items-start">
                                <div className="pt-4">
                                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[1.8px] text-white/55 font-semibold mb-4">
                                        <span>{showDetails?.name || 'Anime'}</span>
                                        <span className="text-white/20">/</span>
                                        <span>Temporada {episodeDetails.season_number}</span>
                                        <span className="text-white/20">/</span>
                                        <span>Episodio {String(episodeDetails.episode_number).padStart(2, '0')}</span>
                                    </div>

                                    <h2 className="text-[40px] leading-[1.02] max-sm:text-[28px] m-0 text-white font-semibold max-w-3xl">
                                        {episodeTitle}
                                    </h2>

                                    <p className="mt-4 text-white/75 text-base leading-[1.8] max-w-[780px]">
                                        {episodeDetails.overview || 'Sem resumo disponivel para este episodio.'}
                                    </p>

                                    <div className="mt-4 flex items-center gap-3 text-white/90">
                                        <div className="flex items-center gap-1 text-yellow-300">
                                            {Array.from({ length: 5 }).map((_, index) => (
                                                <span
                                                    key={index}
                                                    className={`text-[18px] leading-none ${index < tmdbFilledStars ? 'text-yellow-300' : 'text-white/20'}`}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                        <span className="text-[24px] font-semibold">{tmdbDisplayScore ? tmdbDisplayScore.toFixed(1) : 'N/A'}</span>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-white/65">
                                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                                            Lançado dia {airDate}
                                        </span>
                                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                                            Duração {runtime}
                                        </span>
                                        {episodeDirector && (
                                            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                                                Direção {episodeDirector}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-8 flex flex-wrap gap-4">
                                        <button
                                            className="inline-flex items-center justify-center gap-2 min-w-[210px] rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-200 bg-emerald-500 text-white hover:bg-emerald-400"
                                            onClick={() => handleMarkWatched(true)}
                                            type="button"
                                        >
                                            <span>✓</span>
                                            <span>Marcar como visto</span>
                                        </button>

                                        <button
                                            className="inline-flex items-center justify-center gap-2 min-w-[180px] rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-200 bg-[#b90f0f] text-white hover:bg-[#d51515]"
                                            onClick={() => handleMarkWatched(false)}
                                            type="button"
                                        >
                                            <span>⚑</span>
                                            <span>Assistir depois</span>
                                        </button>
                                    </div>

                                    <div className="mt-8 flex flex-wrap items-center gap-3">
                                        <button
                                            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[1.4px] text-white/65"
                                            type="button"
                                        >
                                            {isWatched ? 'Visto' : 'Não visto'}
                                        </button>

                                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                                            <span className="text-[11px] uppercase tracking-[1.4px] text-white/55 font-semibold">Sua nota</span>
                                            <div className="flex gap-1">
                                                {Array.from({ length: 5 }).map((_, index) => {
                                                    const starValueItem = index + 1;
                                                    const isActive = starValueItem <= starValue;

                                                    return (
                                                        <button
                                                            key={starValueItem}
                                                            type="button"
                                                            className={`bg-transparent border-none text-[24px] leading-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${isActive ? 'text-[#ffd166]' : 'text-white/25'}`}
                                                            onMouseEnter={() => setHoverRating(starValueItem)}
                                                            onMouseLeave={() => setHoverRating(0)}
                                                            onClick={() => handleRating(starValueItem)}
                                                            aria-label={`Dar nota ${starValueItem}`}
                                                        >
                                                            ★
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative -mt-28 lg:mt-0 lg:justify-self-end w-full max-w-[420px]">
                                    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/40 shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
                                        <div className="aspect-[4/3]">
                                            <img src={stillImage} alt={episodeDetails.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.85))]">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] uppercase tracking-[1.4px] text-white/55">Imagem do episódio</span>
                                                    <span className="text-sm font-semibold text-white">{episodeDetails.name}</span>
                                                </div>
                                                <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
                                                    {isWatched ? 'Assistido' : 'Não assistido'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex justify-end">
                                <button
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-black/40 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10"
                                    onClick={handleNextEpisode}
                                    disabled={nextLoading}
                                    type="button"
                                >
                                    <span>{nextLoading ? 'Carregando...' : 'Próximo episódio'}</span>
                                    <span>›</span>
                                </button>
                            </div>

                            <div className="mt-4 flex justify-end">
                                {nextError && <p className="m-0 text-[13px] text-white/70">{nextError}</p>}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default EpisodeDetailPage;
