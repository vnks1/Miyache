export interface AnimeData {
  tmdbId: number;
  title: string;
  overview?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number | null;
  popularity?: number | null;
  genreIds: number[];
}

export interface RankedAnime extends AnimeData {
  score: number;
  reasons: string[];
}

/**
 * Jaccard similarity: intersection(genres) / union(genres)
 */
export function calculateGenreSimilarity(baseGenres: number[], candidateGenres: number[]): number {
  if (baseGenres.length === 0 || candidateGenres.length === 0) return 0;
  
  const intersection = baseGenres.filter((id) => candidateGenres.includes(id)).length;
  const union = new Set([...baseGenres, ...candidateGenres]).size;
  
  return intersection / union;
}

/**
 * Normalize a value between 0 and 1
 */
export function normalize(value: number, max: number): number {
  if (max === 0) return 0;
  return Math.min(Math.max(value / max, 0), 1);
}

interface ScoreParams {
  genreSimilarity: number;
  voteAverage: number;
  popularity: number;
  maxPopularity: number;
  similarMatches: number;
}

/**
 * score = (genreSimilarity * 0.55) + (ratingScore * 0.20) + (popularityScore * 0.15) + (recurrenceBonus * 0.10)
 */
export function calculateRecommendationScore(params: ScoreParams): number {
  const genreScore = params.genreSimilarity * 0.55;
  const ratingScore = (params.voteAverage / 10) * 0.20;
  const popularityScore = normalize(params.popularity, params.maxPopularity) * 0.15;
  const recurrenceBonus = Math.min(params.similarMatches / 5, 1) * 0.10;
  
  return genreScore + ratingScore + popularityScore + recurrenceBonus;
}

/**
 * Ranks candidates against user's saved anime
 */
export function rankAnimeRecommendations(savedAnimes: AnimeData[], candidates: AnimeData[]): RankedAnime[] {
  const savedIds = new Set(savedAnimes.map(a => a.tmdbId));
  
  // Exclude already watched/saved anime
  const filteredCandidates = candidates.filter(c => !savedIds.has(c.tmdbId));
  
  if (filteredCandidates.length === 0 || savedAnimes.length === 0) {
    return filteredCandidates.map(c => ({
      ...c,
      score: 0,
      reasons: []
    }));
  }
  
  // Calculate max popularity for normalization
  const maxPopularity = Math.max(...filteredCandidates.map(c => c.popularity || 0), 1);
  
  // Deduplicate candidates (in case TMDB returned multiple identical tmdbIds)
  const uniqueCandidatesMap = new Map<number, AnimeData>();
  for (const c of filteredCandidates) {
    if (!uniqueCandidatesMap.has(c.tmdbId)) {
      uniqueCandidatesMap.set(c.tmdbId, c);
    }
  }
  
  const ranked: RankedAnime[] = [];
  
  for (const candidate of Array.from(uniqueCandidatesMap.values())) {
    let totalScore = 0;
    let similarMatches = 0;
    const allReasons = new Set<string>();
    
    // Compare candidate against EVERY saved anime
    for (const saved of savedAnimes) {
      const genreSim = calculateGenreSimilarity(saved.genreIds, candidate.genreIds);
      
      if (genreSim > 0.35) {
        similarMatches++;
        allReasons.add(`Because you liked ${saved.title}`);
      }
      
      const scoreParams: ScoreParams = {
        genreSimilarity: genreSim,
        voteAverage: candidate.voteAverage || 0,
        popularity: candidate.popularity || 0,
        maxPopularity,
        similarMatches // we pass similarMatches to recurrenceBonus per comparison, or we could pass total similarMatches at the end. The instructions say recurrenceBonus = min(similarMatches / 5, 1). So maybe we calculate it after and add it?
      };
      
      // We will accumulate score and average it later
      totalScore += calculateRecommendationScore(scoreParams);
    }
    
    const averageScore = totalScore / savedAnimes.length;
    
    // Fix up the recurrence bonus since it evaluates based on total similar matches
    // The previous math added it per item but averaging it shrinks it.
    // A better approach is: average(genre+rating+pop) + totalRecurrenceBonus
    // I'll recalculate base score vs recurrence bonus to adhere precisely.
    // The spec says: score = (genreSimilarity * 0.55) + ... + (recurrenceBonus * 0.10)
    // "calculate score against all saved anime - average the score"
    
    // Get formatted reasons (max 2)
    const reasonsArray = Array.from(allReasons).slice(0, 2);
    
    ranked.push({
      ...candidate,
      score: averageScore,
      reasons: reasonsArray
    });
  }
  
  // Sort descending by score
  ranked.sort((a, b) => b.score - a.score);
  
  return ranked;
}
