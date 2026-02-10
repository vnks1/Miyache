import AnimeCard from './AnimeCard';
import './AnimeSection.css';

function AnimeSection({ title, animes, showProgress = false }) {
    return (
        <section className="anime-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{title}</h2>
                    <a href="#" className="section-link">
                        Ver todos
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </a>
                </div>
            </div>

            <div className="anime-grid">
                {animes.map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} showProgress={showProgress} />
                ))}
            </div>
        </section>
    );
}

export default AnimeSection;
