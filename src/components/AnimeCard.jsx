import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getTmdbIdByTitle } from '../data/animeMapping';

function AnimeCard({ anime, showProgress = false }) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const tmdbId = getTmdbIdByTitle(anime.title);
    const searchTitle = anime.searchTitle || anime.title;
    const shouldUseTmdbId = anime.source !== 'anilist' && !!tmdbId;
    const linkTarget = shouldUseTmdbId
        ? `/anime/${tmdbId}`
        : `/anime/${encodeURIComponent(searchTitle)}`;

    const handleBookmarkClick = (e) => {
        e.preventDefault(); // Prevent navigation when clicking bookmark
        setIsBookmarked(!isBookmarked);
    };

    const cardContent = (
        <>
            <div className="relative w-full aspect-[290/346] rounded-md overflow-hidden bg-bg-secondary">
                <img 
                    src={anime.image} 
                    alt={anime.title} 
                    className="w-full h-full object-cover transition-transform duration-250 group-hover:scale-105"
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://placehold.co/400x600/1e1e24/a0a0b0?text=Sem+Imagem';
                    }} 
                />

                <button
                    className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/60 rounded-sm text-text-primary backdrop-blur-[4px] transition-all duration-150 z-10 
                    ${isBookmarked ? 'opacity-100 bg-accent-blue text-white' : 'opacity-0 group-hover:opacity-100 hover:bg-accent-blue hover:scale-110'}`}
                    onClick={handleBookmarkClick}
                    aria-label="Salvar"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                </button>
            </div>

            <div className="py-2 flex-grow flex flex-col">
                <h3 className="text-[0.9rem] font-semibold text-text-primary mb-1 whitespace-nowrap overflow-hidden text-ellipsis">{anime.title}</h3>
                <div className="text-xs text-text-muted mb-1">
                    <span>{anime.year}</span>
                    {anime.genre && (
                        <>
                            <span className="mx-[2px]">,</span>
                            <span>{anime.genre}</span>
                        </>
                    )}
                </div>
                {anime.rating && (
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <svg className="w-3 h-3 fill-[#fbbf24]" viewBox="0 0 24 24">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span>{anime.rating}</span>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <Link to={linkTarget} state={{ title: searchTitle }} className="flex flex-col w-full h-full min-w-0 cursor-pointer transition-transform duration-250 decoration-transparent text-inherit hover:-translate-y-2 group">
            {cardContent}
        </Link>
    );
}

export default AnimeCard;
