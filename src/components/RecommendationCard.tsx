import React from 'react';
import { AnimeData } from '../services/recommendationApi';

interface RecommendationCardProps {
  anime: AnimeData & { score?: number; reasons?: string[] };
  onClick?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ anime, onClick }) => {
  const imageUrl = anime.posterUrl
    || (anime.posterPath ? `https://image.tmdb.org/t/p/w500${anime.posterPath}` : null)
    || 'https://via.placeholder.com/500x750?text=No+Image';

  const reason = anime.reasons && anime.reasons.length > 0 ? anime.reasons[0] : null;

  return (
    <div 
      onClick={onClick}
      className="group relative flex-shrink-0 w-36 sm:w-48 md:w-56 cursor-pointer snap-start transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 rounded-2xl overflow-hidden bg-gray-900 border border-gray-800"
    >
      <div className="aspect-[2/3] w-full relative overflow-hidden">
        <img 
          src={imageUrl} 
          alt={anime.title} 
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
        
        {reason && (
          <div className="absolute top-2 left-2 right-2 flex justify-start">
            <span className="bg-purple-600/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full text-white line-clamp-2 leading-tight shadow-md">
              {reason}
            </span>
          </div>
        )}
        
        {(typeof anime.voteAverage === 'number' || typeof anime.score === 'number') ? (
          <div className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-gray-700">
            <span className="text-xs font-bold text-yellow-400">{(anime.voteAverage ?? anime.score ?? 0).toFixed(1)}</span>
          </div>
        ) : null}
      </div>

      <div className="p-3 absolute bottom-0 w-full">
        <h3 className="text-sm sm:text-base font-semibold text-white line-clamp-2 drop-shadow-lg group-hover:text-purple-400 transition-colors">
          {anime.title}
        </h3>
      </div>
    </div>
  );
};
