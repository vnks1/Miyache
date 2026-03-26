import prisma from '../../db/client.js';

export interface SaveAnimeInput {
  tmdbId: number;
  title: string;
  overview?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number | null;
  popularity?: number | null;
  genreIds: number[];
  liked?: boolean;
  watched?: boolean;
}

export interface SaveAniListAnimeInput {
  anilistId: number;
  title: string;
  synopsis?: string | null;
  posterUrl?: string | null;
  bannerUrl?: string | null;
  score?: number | null;
  genres?: string[];
  liked?: boolean;
  watched?: boolean;
}

export class UsersService {
  async findOrCreateUserByNick(nick: string) {
    const identifier = nick.trim().toLowerCase();
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { nick: identifier },
          { email: identifier },
        ]
      }
    });
    
    // Fallback logic for creation since they asked to "create if not exists"
    // Since this system has an email/password flow currently, creating a shell user
    // with a throwaway email might be necessary to bypass existing schema rules
    // if email is required. We made email unique, so we can use a dummy email.
    if (!user) {
      const isEmail = identifier.includes('@');
      user = await prisma.user.create({
        data: {
          nick: isEmail ? identifier : identifier,
          email: isEmail ? identifier : `${identifier}@placeholder.local`,
          passwordHash: 'placeholder',
        }
      });
    }
    
    return user;
  }

  async saveAnime(nick: string, data: SaveAnimeInput) {
    const user = await this.findOrCreateUserByNick(nick);
    
    // Upsert the saved anime to history
    return await prisma.userAnime.upsert({
      where: {
        userId_tmdbId: {
          userId: user.id,
          tmdbId: data.tmdbId,
        }
      },
      update: {
        liked: data.liked ?? true,
        watched: data.watched ?? true,
      },
      create: {
        userId: user.id,
        tmdbId: data.tmdbId,
        title: data.title,
        overview: data.overview,
        posterPath: data.posterPath,
        backdropPath: data.backdropPath,
        voteAverage: data.voteAverage,
        popularity: data.popularity,
        genreIds: data.genreIds,
        liked: data.liked ?? true,
        watched: data.watched ?? true,
      }
    });
  }

  async getSavedAnime(nick: string) {
    const identifier = nick.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { nick: identifier },
          { email: identifier },
        ]
      },
      include: {
        savedAnime: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!user) return [];
    
    return user.savedAnime;
  }

  async saveAniListAnime(nick: string, data: SaveAniListAnimeInput) {
    const user = await this.findOrCreateUserByNick(nick);

    return await prisma.userAniListAnime.upsert({
      where: {
        userId_anilistId: {
          userId: user.id,
          anilistId: data.anilistId,
        }
      },
      update: {
        title: data.title,
        synopsis: data.synopsis ?? null,
        posterUrl: data.posterUrl ?? null,
        bannerUrl: data.bannerUrl ?? null,
        score: data.score ?? null,
        genres: data.genres ?? [],
        liked: data.liked ?? true,
        watched: data.watched ?? true,
      },
      create: {
        userId: user.id,
        anilistId: data.anilistId,
        title: data.title,
        synopsis: data.synopsis ?? null,
        posterUrl: data.posterUrl ?? null,
        bannerUrl: data.bannerUrl ?? null,
        score: data.score ?? null,
        genres: data.genres ?? [],
        liked: data.liked ?? true,
        watched: data.watched ?? true,
      }
    });
  }

  async getSavedAniListAnime(nick: string) {
    const identifier = nick.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { nick: identifier },
          { email: identifier },
        ]
      },
      include: {
        savedAniList: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) return [];

    return user.savedAniList;
  }
}

export const usersService = new UsersService();
