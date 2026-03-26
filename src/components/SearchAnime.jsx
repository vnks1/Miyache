import React, { useState, useEffect, useRef } from 'react';
import { searchMedia } from '../services/api/media.service';

function mapAniListSearchItem(media) {
    return {
        id: media.id,
        title: media.title,
        posterUrl: media.posterUrl || '',
        releaseYear: media.releaseYear,
        synopsis: media.synopsis || '',
        score: media.score,
        source: 'anilist'
    };
}

/**
 * SearchAnime Component
 * Provides dynamic anime search with debouncing and result display
 * @param {Function} onAnimeSelect - Callback when user selects an anime
 */
export default function SearchAnime({ onAnimeSelect = null }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState(null);
    const debounceTimeout = useRef(null);

    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (!searchQuery.trim()) {
            setResults([]);
            setShowResults(false);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        debounceTimeout.current = setTimeout(async () => {
            try {
                const result = await searchMedia(searchQuery, 1, 10);
                const animeResults = (result?.items || []).map(mapAniListSearchItem);
                setResults(animeResults);
                setShowResults(true);

                if (animeResults.length === 0) {
                    setError('Nenhum anime encontrado. Tente outro título.');
                }
            } catch (err) {
                console.error('Search error:', err);
                setError('Erro ao buscar animes. Tente novamente.');
                setResults([]);
                setShowResults(false);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [searchQuery]);

    const handleSelectAnime = (anime) => {
        if (onAnimeSelect) {
            onAnimeSelect(anime);
        }
        setSearchQuery('');
        setShowResults(false);
    };

    const handleClickOutside = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setShowResults(false);
        }
    };

    return (
        <div className="w-full max-w-[600px] mx-auto relative z-[100]">
            <div className="relative flex items-center w-full">
                <input
                    type="text"
                    placeholder="Buscar animes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setShowResults(true)}
                    onBlur={handleClickOutside}
                    className="w-full py-3 pr-10 pl-4 border-2 border-[#ddd] rounded-lg text-base transition-all duration-300 bg-white focus:outline-none focus:border-[#ff6b6b] focus:ring-[3px] focus:ring-[#ff6b6b]/10 placeholder:text-[#999]"
                />
                {searchQuery && (
                    <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-[18px] cursor-pointer text-[#999] px-2 py-1 rounded transition-all duration-200 hover:text-[#333] hover:bg-black/5"
                        onClick={() => {
                            setSearchQuery('');
                            setResults([]);
                            setShowResults(false);
                            setError(null);
                        }}
                        title="Limpar busca"
                    >
                        ✕
                    </button>
                )}
            </div>

            {isLoading && <div className="mt-3 py-3 px-4 bg-[#f0f0f0] rounded-md text-center text-[#666] text-sm animate-pulse">Buscando animes...</div>}

            {error && <div className="mt-3 py-3 px-4 bg-[#fee] border-l-4 border-[#ff6b6b] rounded text-[#c00] text-sm">{error}</div>}

            {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#ddd] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] max-h-[500px] overflow-y-auto z-[1000] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#ddd] [&::-webkit-scrollbar-thumb]:rounded hover:[&::-webkit-scrollbar-thumb]:bg-[#bbb]">
                    {results.map((anime) => (
                        <div
                            key={`${anime.source}-${anime.id}`}
                            className="flex gap-3 p-3 border-b border-[#eee] last:border-none cursor-pointer transition-colors duration-200 hover:bg-[#f9f9f9] max-sm:gap-2.5 max-sm:p-2.5"
                            onClick={() => handleSelectAnime(anime)}
                        >
                            <div className="shrink-0 w-[60px] h-[90px] max-sm:w-[50px] max-sm:h-[75px] rounded overflow-hidden bg-[#eee]">
                                {anime.posterUrl ? (
                                    <img
                                        src={anime.posterUrl}
                                        alt={anime.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-poster.png';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#e0e0e0] text-[#999] text-xs text-center p-1">Sem imagem</div>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                                <h4 className="m-0 text-sm max-sm:text-[13px] font-semibold text-[#333] whitespace-nowrap overflow-hidden text-ellipsis">
                                    {anime.title}
                                </h4>
                                <p className="m-0 text-xs text-[#999]">
                                    {anime.releaseYear || 'N/A'}
                                </p>
                                <p className="m-0 text-xs max-sm:text-[11px] text-[#666] leading-[1.3] line-clamp-2 max-sm:line-clamp-1">
                                    {anime.synopsis ? anime.synopsis.substring(0, 100) + '...' : 'Sem descrição'}
                                </p>
                                <div className="text-xs text-[#ff6b6b] font-semibold mt-1">
                                    ⭐ {typeof anime.score === 'number' ? anime.score.toFixed(1) : 'N/A'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
