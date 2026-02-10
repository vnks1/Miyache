import './EpisodeCard.css';

function EpisodeCard({ episode, animeName }) {
    const placeholderImage = 'https://via.placeholder.com/400x225/1a1a2e/ffffff?text=Episode';
    const episodeImage = episode.still_path
        ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
        : placeholderImage;

    return (
        <div className="episode-card">
            <div className="episode-thumbnail">
                <img src={episodeImage} alt={episode.name} />
            </div>
            <div className="episode-info">
                <span className="episode-label">{animeName}</span>
                <h4 className="episode-title">
                    T{episode.season_number} E{String(episode.episode_number).padStart(2, '0')} - {episode.name}
                </h4>
            </div>
        </div>
    );
}

export default EpisodeCard;
