import React, { useRef } from 'react';
import { RecommendationCard } from './RecommendationCard';
import { AnimeData } from '../services/recommendationApi';

interface RecommendationRowProps {
  title: string;
  animes: (AnimeData & { score?: number; reasons?: string[] })[];
}

export const RecommendationRow: React.FC<RecommendationRowProps> = ({ title, animes }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  if (!animes || animes.length === 0) return null;

  return (
    <div className="py-6 w-full">
      <div className="px-4 md:px-8 mb-4 flex justify-between items-end">
        <h2 className="text-xl md:text-2xl font-bold text-white border-l-4 border-purple-500 pl-3">
          {title}
        </h2>
      </div>
      
      <div className="relative">
        <div 
          ref={rowRef}
          className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-4 md:px-8 pb-8 pt-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {animes.map((anime) => (
            <RecommendationCard 
              key={`${anime.source || 'anilist'}-${anime.anilistId || anime.id || anime.title}`} 
              anime={anime} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
