import { useState } from 'react';
import EpisodeCard from './EpisodeCard';
import './EpisodeGrid.css';

function EpisodeGrid({ episodes, animeName }) {
    const [visibleCount, setVisibleCount] = useState(20);

    if (!episodes || episodes.length === 0) {
        return (
            <div className="episodes-empty">
                <p>Nenhum episódio disponível</p>
            </div>
        );
    }

    const visibleEpisodes = episodes.slice(0, visibleCount);
    const hasMore = visibleCount < episodes.length;

    const loadMore = () => {
        setVisibleCount(prev => Math.min(prev + 20, episodes.length));
    };

    return (
        <>
            <div className="episode-grid">
                {visibleEpisodes.map((episode) => (
                    <EpisodeCard
                        key={episode.id}
                        episode={episode}
                        animeName={animeName}
                    />
                ))}
            </div>

            {hasMore && (
                <div className="load-more-container">
                    <button className="load-more-btn" onClick={loadMore}>
                        Carregar mais
                    </button>
                </div>
            )}
        </>
    );
}

export default EpisodeGrid;
