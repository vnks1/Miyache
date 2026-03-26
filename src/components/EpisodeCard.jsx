import { Link } from 'react-router-dom';

function buildEpisodeRouteKey(episode, showId) {
    if (showId && !episode.previewOnly) {
        return `tmdb-${showId}-s${episode.season_number}-e${episode.episode_number}`;
    }

    return String(episode.id || '');
}

function EpisodeCard({ episode, animeName, showId }) {
    const placeholderImage = 'https://via.placeholder.com/400x225/1a1a2e/ffffff?text=Episode';
    const episodeImage = episode.previewImage
        || (episode.still_path
        ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
        : placeholderImage);
    const episodeRouteKey = buildEpisodeRouteKey(episode, showId);

    const linkState = {
        showId,
        seasonNumber: episode.season_number,
        episodeNumber: episode.episode_number
    };

    const episodeTitle = episode.title
        || `T${episode.season_number} E${String(episode.episode_number).padStart(2, '0')} - ${episode.name}`;

    const cardBody = (
        <>
            <div className="relative w-full aspect-video overflow-hidden bg-[#1a1a2e]">
                <img src={episodeImage} alt={episode.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="p-3">
                <span className="block text-[11px] font-bold uppercase tracking-[1px] text-white/60 mb-1.5">{animeName}</span>
                <h4 className="text-sm font-semibold text-white m-0 leading-[1.4] overflow-hidden line-clamp-2">
                    {episodeTitle}
                </h4>
            </div>
        </>
    );

    if (!episodeRouteKey) {
        return (
            <div className="block bg-white/5 rounded-lg overflow-hidden transition-all duration-300 cursor-default text-inherit group">
                {cardBody}
            </div>
        );
    }

    return (
        <Link
            to={`/episode/${episodeRouteKey}`}
            state={linkState}
            className="block bg-white/5 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer no-underline text-inherit hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)] group"
        >
            {cardBody}
        </Link>
    );
}

export default EpisodeCard;
