import Badge from './Badge';
import './AnimeHero.css';

function AnimeHero({ anime }) {
    const backdropImage = anime.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${anime.backdrop_path}`
        : 'https://via.placeholder.com/1280x720/1a1a2e/ffffff?text=Backdrop';

    const posterImage = anime.poster_path
        ? `https://image.tmdb.org/t/p/w500${anime.poster_path}`
        : 'https://via.placeholder.com/500x750/1a1a2e/ffffff?text=Poster';

    const rating = anime.vote_average ? anime.vote_average.toFixed(1) : 'N/A';
    const year = anime.first_air_date ? new Date(anime.first_air_date).getFullYear() : 'N/A';

    return (
        <div className="anime-hero">
            <div
                className="anime-hero-backdrop"
                style={{ backgroundImage: `url(${backdropImage})` }}
            >
                <div className="anime-hero-overlay"></div>
            </div>

            <div className="anime-hero-content container">
                <div className="anime-hero-poster">
                    <img src={posterImage} alt={anime.name} />
                </div>

                <div className="anime-hero-info">
                    <div className="hero-week-highlight">
                        DESTAQUE DA SEMANA
                    </div>

                    <button className="share-btn" aria-label="Compartilhar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                    </button>

                    <div className="anime-hero-title-row">
                        <h1 className="anime-hero-title">{anime.name}</h1>
                        <div className="anime-hero-rating">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <span>{rating}</span>
                        </div>
                    </div>

                    <div className="anime-hero-badges">
                        {anime.status && (
                            <Badge variant="primary">
                                {anime.status === 'Returning Series' ? 'Lançando' : 'Finalizado'}
                            </Badge>
                        )}
                        <Badge variant="outlined">{year}</Badge>
                        <Badge variant="outlined">Legendado | Dublado</Badge>
                    </div>

                    {anime.overview && (
                        <p className="anime-hero-description">{anime.overview}</p>
                    )}

                    <div className="anime-hero-actions">
                        <button className="btn-continue">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
                            </svg>
                            Continuar
                        </button>
                        <button className="btn-watch-later">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Assistir mais tarde
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnimeHero;
