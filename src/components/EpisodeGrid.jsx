import { useEffect, useState } from 'react';
import EpisodeCard from './EpisodeCard';

function EpisodeGrid({ episodes, animeName, showId }) {
    const MOBILE_BREAKPOINT = 640;
    const MOBILE_BATCH_SIZE = 5;
    const DESKTOP_BATCH_SIZE = 20;

    const getIsMobile = () => window.innerWidth < MOBILE_BREAKPOINT;
    const [isMobile, setIsMobile] = useState(getIsMobile);
    const [visibleCount, setVisibleCount] = useState(() =>
        getIsMobile() ? MOBILE_BATCH_SIZE : DESKTOP_BATCH_SIZE
    );

    useEffect(() => {
        const onResize = () => {
            setIsMobile(getIsMobile());
        };

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        setVisibleCount(isMobile ? MOBILE_BATCH_SIZE : DESKTOP_BATCH_SIZE);
    }, [episodes, isMobile]);

    if (!episodes || episodes.length === 0) {
        return (
            <div className="text-center py-[60px] px-5 text-white/60">
                <p className="text-base m-0">Nenhum episódio disponível</p>
            </div>
        );
    }

    const visibleEpisodes = episodes.slice(0, visibleCount);
    const hasMore = visibleCount < episodes.length;

    const loadMore = () => {
        const batchSize = isMobile ? MOBILE_BATCH_SIZE : DESKTOP_BATCH_SIZE;
        setVisibleCount(prev => Math.min(prev + batchSize, episodes.length));
    };

    return (
        <>
            <div className="grid grid-cols-4 max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-5 max-md:gap-4 mt-6">
                {visibleEpisodes.map((episode) => (
                    <EpisodeCard
                        key={episode.id}
                        episode={episode}
                        animeName={animeName}
                        showId={showId}
                    />
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center mt-10">
                    <button className="py-3.5 px-10 bg-[#0E0E0E] text-white border border-white/20 rounded-full text-xs font-semibold cursor-pointer transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]" onClick={loadMore}>
                        Carregar mais
                    </button>
                </div>
            )}
        </>
    );
}

export default EpisodeGrid;
