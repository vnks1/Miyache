import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimeCard from '../components/AnimeCard';
import { getPopularMedia, searchMedia } from '../services/api/media.service';

const filterOptions = {
    season: [
        { value: 'all', label: 'Qualquer' },
        { value: 'winter', label: 'Inverno' },
        { value: 'spring', label: 'Primavera' },
        { value: 'summer', label: 'Verao' },
        { value: 'fall', label: 'Outono' }
    ],
    format: [
        { value: 'all', label: 'Todos' },
        { value: 'tv', label: 'TV' },
        { value: 'movie', label: 'Filme' },
        { value: 'ova', label: 'OVA' },
        { value: 'ona', label: 'ONA' }
    ],
    status: [
        { value: 'all', label: 'Qualquer' },
        { value: 'airing', label: 'Em exibicao' },
        { value: 'finished', label: 'Finalizado' },
        { value: 'upcoming', label: 'Proximo' }
    ]
};

function mapAniListStatus(status) {
    if (!status) return 'unknown';
    if (status === 'RELEASING') return 'airing';
    if (status === 'FINISHED') return 'finished';
    if (status === 'NOT_YET_RELEASED') return 'upcoming';
    if (status === 'CANCELLED') return 'finished';
    if (status === 'HIATUS') return 'airing';
    return 'unknown';
}

function mapAniListFormat(format) {
    if (!format) return 'tv';
    if (format === 'TV' || format === 'TV_SHORT') return 'tv';
    if (format === 'MOVIE') return 'movie';
    if (format === 'OVA') return 'ova';
    if (format === 'ONA') return 'ona';
    return 'tv';
}

function inferSeason(month) {
    if (!month) return null;
    if ([12, 1, 2].includes(month)) return 'winter';
    if ([3, 4, 5].includes(month)) return 'spring';
    if ([6, 7, 8].includes(month)) return 'summer';
    return 'fall';
}

function mapMediaToAnimeCard(media) {
    return {
        id: media.id,
        source: 'anilist',
        title: media.title,
        searchTitle: media.title,
        image: media.posterUrl || 'https://placehold.co/400x600/1e1e24/a0a0b0?text=Sem+Imagem',
        year: media.releaseYear ? String(media.releaseYear) : 'N/A',
        releaseYear: media.releaseYear || null,
        releaseMonth: media.releaseMonth || null,
        genre: media.genres?.[0] || 'Anime',
        genres: Array.isArray(media.genres) ? media.genres : [],
        rating: typeof media.score === 'number' ? media.score.toFixed(1) : null,
        format: mapAniListFormat(media.format),
        status: mapAniListStatus(media.status)
    };
}

function applyAniListFilters(items, filters) {
    return items.filter((anime) => {
        if (filters.genre !== 'all') {
            const hasGenre = anime.genres.some((g) => g.toLowerCase() === String(filters.genre).toLowerCase());
            if (!hasGenre) return false;
        }

        if (filters.year !== 'all' && String(anime.releaseYear || '') !== String(filters.year)) {
            return false;
        }

        if (filters.season !== 'all') {
            const season = inferSeason(anime.releaseMonth);
            if (season !== filters.season) return false;
        }

        if (filters.format !== 'all' && anime.format !== filters.format) {
            return false;
        }

        if (filters.status !== 'all' && anime.status !== filters.status) {
            return false;
        }

        return true;
    });
}

function dedupeBySourceAndId(list) {
    const seen = new Set();
    return list.filter((item) => {
        const key = `${item.source || 'anilist'}:${item.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function ExplorePage() {
    const [isLoggedIn] = useState(true);
    const [genreOptions, setGenreOptions] = useState([{ value: 'all', label: 'Todos' }]);
    const [filters, setFilters] = useState({
        search: '',
        genre: 'all',
        year: 'all',
        season: 'all',
        format: 'all',
        status: 'all'
    });
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [animes, setAnimes] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [loadError, setLoadError] = useState('');

    const observer = useRef();

    const lastAnimeElementRef = useCallback((node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                setPage((prevPage) => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(filters.search.trim());
        }, 350);

        return () => clearTimeout(timeoutId);
    }, [filters.search]);

    useEffect(() => {
        const loadGenres = async () => {
            try {
                const popular = await getPopularMedia(1, 50);
                const genresSet = new Set();
                (popular?.items || []).forEach((item) => {
                    (item.genres || []).forEach((genre) => {
                        if (genre) genresSet.add(String(genre));
                    });
                });

                const mappedGenres = Array.from(genresSet)
                    .sort((a, b) => a.localeCompare(b))
                    .map((genre) => ({ value: genre, label: genre }));

                setGenreOptions([{ value: 'all', label: 'Todos' }, ...mappedGenres]);
            } catch (error) {
                console.error('Error loading genres from AniList:', error);
            }
        };

        loadGenres();
    }, []);

    useEffect(() => {
        setAnimes([]);
        setPage(1);
        setHasMore(true);
    }, [debouncedSearch, filters.genre, filters.year, filters.season, filters.format, filters.status]);

    useEffect(() => {
        const fetchAnimes = async () => {
            setLoading(true);
            setLoadError('');
            try {
                const perPage = 20;
                const result = debouncedSearch
                    ? await searchMedia(debouncedSearch, page, perPage)
                    : await getPopularMedia(page, perPage);

                const mapped = (result?.items || []).map(mapMediaToAnimeCard);
                const filtered = applyAniListFilters(mapped, filters);

                setAnimes((prevAnimes) => {
                    if (page === 1) {
                        return filtered;
                    }
                    return dedupeBySourceAndId([...prevAnimes, ...filtered]);
                });

                const totalPages = result?.totalPages || 0;
                setHasMore(page < totalPages && page <= 500);
            } catch (error) {
                console.error('Error fetching animes from AniList:', error);
                setLoadError('Não foi possível carregar os animes agora.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnimes();
    }, [page, debouncedSearch, filters]);

    const years = Array.from({ length: 36 }, (_, index) => {
        const year = new Date().getFullYear() - index;
        return { value: String(year), label: String(year) };
    });
    years.unshift({ value: 'all', label: 'Qualquer' });

    const controlBaseClasses = 'w-full h-10 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-text-primary px-3 outline-none transition-all duration-200 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20';

    const handleFilterChange = (key, value) => {
        setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
    };

    return (
        <>
            <Header isLoggedIn={isLoggedIn} />

            <main className="bg-[#09090b] min-h-[calc(100vh-100px)] pt-[100px] pb-[60px]">
                <section className="py-5">
                    <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 xl:px-20">
                        <div className="mb-6 p-4 md:p-5 rounded-2xl border border-border-color">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
                                <div>
                                    <label htmlFor="explore-search" className="block text-xs font-semibold text-text-primary mb-2">Buscar</label>
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                            <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <input
                                            id="explore-search"
                                            type="text"
                                            value={filters.search}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                            placeholder="Pesquisar..."
                                            className={`${controlBaseClasses} pl-10 placeholder:text-text-muted`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="explore-genre" className="block text-xs font-semibold text-text-primary mb-2">Generos</label>
                                    <select id="explore-genre" value={filters.genre} onChange={(e) => handleFilterChange('genre', e.target.value)} className={`${controlBaseClasses} appearance-none bg-[linear-gradient(45deg,transparent_50%,#71717a_50%),linear-gradient(135deg,#71717a_50%,transparent_50%)] bg-[position:calc(100%-18px)_17px,calc(100%-12px)_17px] bg-[size:6px_6px,6px_6px] bg-no-repeat pr-8`}>
                                        {genreOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="explore-year" className="block text-xs font-semibold text-text-primary mb-2">Ano</label>
                                    <select id="explore-year" value={filters.year} onChange={(e) => handleFilterChange('year', e.target.value)} className={`${controlBaseClasses} appearance-none bg-[linear-gradient(45deg,transparent_50%,#71717a_50%),linear-gradient(135deg,#71717a_50%,transparent_50%)] bg-[position:calc(100%-18px)_17px,calc(100%-12px)_17px] bg-[size:6px_6px,6px_6px] bg-no-repeat pr-8`}>
                                        {years.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="explore-season" className="block text-xs font-semibold text-text-primary mb-2">Temporada</label>
                                    <select id="explore-season" value={filters.season} onChange={(e) => handleFilterChange('season', e.target.value)} className={`${controlBaseClasses} appearance-none bg-[linear-gradient(45deg,transparent_50%,#71717a_50%),linear-gradient(135deg,#71717a_50%,transparent_50%)] bg-[position:calc(100%-18px)_17px,calc(100%-12px)_17px] bg-[size:6px_6px,6px_6px] bg-no-repeat pr-8`}>
                                        {filterOptions.season.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="explore-format" className="block text-xs font-semibold text-text-primary mb-2">Formato</label>
                                    <select id="explore-format" value={filters.format} onChange={(e) => handleFilterChange('format', e.target.value)} className={`${controlBaseClasses} appearance-none bg-[linear-gradient(45deg,transparent_50%,#71717a_50%),linear-gradient(135deg,#71717a_50%,transparent_50%)] bg-[position:calc(100%-18px)_17px,calc(100%-12px)_17px] bg-[size:6px_6px,6px_6px] bg-no-repeat pr-8`}>
                                        {filterOptions.format.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="explore-status" className="block text-xs font-semibold text-text-primary mb-2">Status</label>
                                    <select id="explore-status" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className={`${controlBaseClasses} appearance-none bg-[linear-gradient(45deg,transparent_50%,#71717a_50%),linear-gradient(135deg,#71717a_50%,transparent_50%)] bg-[position:calc(100%-18px)_17px,calc(100%-12px)_17px] bg-[size:6px_6px,6px_6px] bg-no-repeat pr-8`}>
                                        {filterOptions.status.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-5 max-xl:grid-cols-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-2 gap-5 max-xl:gap-4 max-md:gap-3 max-sm:gap-2.5">
                            {animes.map((anime, index) => (
                                <AnimeCard key={`anime-${anime.source || 'anilist'}-${anime.id}-${index}`} anime={anime} />
                            ))}
                        </div>

                        {loadError && (
                            <div className="text-center py-6 text-text-secondary text-sm col-span-full">{loadError}</div>
                        )}

                        {!loading && hasMore && (
                            <div ref={lastAnimeElementRef} style={{ height: '20px' }}></div>
                        )}

                        {loading && (
                            <div className="text-center py-10 text-text-secondary flex flex-col items-center justify-center gap-3 text-sm col-span-full">
                                <div className="w-[30px] h-[30px] border-[3px] border-white/10 rounded-full border-t-[#3b82f6] animate-spin"></div>
                                <p>Carregando mais animes...</p>
                            </div>
                        )}

                        {!hasMore && animes.length > 0 && (
                            <div className="text-center py-10 text-text-secondary flex flex-col items-center justify-center gap-3 text-sm col-span-full">
                                <p>Voce chegou ao fim da lista!</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}

export default ExplorePage;
