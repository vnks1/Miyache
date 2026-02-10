import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getTmdbIdByTitle } from '../data/animeMapping';
import './AnimeCard.css';

function AnimeCard({ anime, showProgress = false }) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const tmdbId = getTmdbIdByTitle(anime.title);

    const handleBookmarkClick = (e) => {
        e.preventDefault(); // Prevent navigation when clicking bookmark
        setIsBookmarked(!isBookmarked);
    };

    const cardContent = (
        <>
            <div className="anime-card-image">
                <img src={anime.image} alt={anime.title} />

                <button
                    className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                    onClick={handleBookmarkClick}
                    aria-label="Salvar"
                >
                    <svg viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                </button>
            </div>

            <div className="anime-card-info">
                <h3 className="anime-card-title">{anime.title}</h3>
                <div className="anime-card-meta">
                    <span className="anime-card-year">{anime.year}</span>
                    {anime.genre && (
                        <>
                            <span className="meta-separator">,</span>
                            <span className="anime-card-genre">{anime.genre}</span>
                        </>
                    )}
                </div>
                {anime.rating && (
                    <div className="anime-card-rating">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span>{anime.rating}</span>
                    </div>
                )}
            </div>
        </>
    );

    // If we have a TMDB ID, wrap in Link
    if (tmdbId) {
        return (
            <Link to={`/anime/${tmdbId}`} className="anime-card">
                {cardContent}
            </Link>
        );
    }

    // Otherwise, just return the card without link
    return (
        <div className="anime-card">
            {cardContent}
        </div>
    );
}

export default AnimeCard;
