import prisma from '../../db/client.js';

export interface EpisodeProgressInput {
  episodeKey: string;
  source: string;
  tmdbShowId?: number | null;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  animeTitle: string;
  episodeTitle?: string | null;
  overview?: string | null;
  stillPath?: string | null;
  backdropPath?: string | null;
  watched?: boolean;
  rating?: number | null;
}

type EpisodeProgressRecord = {
  userId: string;
  episodeKey: string;
  source: string;
  tmdbShowId: number | null;
  seasonNumber: number | null;
  episodeNumber: number | null;
  animeTitle: string;
  episodeTitle: string | null;
  overview: string | null;
  stillPath: string | null;
  backdropPath: string | null;
  watched: boolean;
  rating: number | null;
  createdAt: Date;
  updatedAt: Date;
};

function getMongoClient() {
  return prisma as unknown as {
    $runCommandRaw: (command: Record<string, unknown>) => Promise<any>;
  };
}

function normalizeRecord(record: any): EpisodeProgressRecord | null {
  if (!record) return null;

  return {
    userId: record.userId,
    episodeKey: record.episodeKey,
    source: record.source,
    tmdbShowId: record.tmdbShowId ?? null,
    seasonNumber: record.seasonNumber ?? null,
    episodeNumber: record.episodeNumber ?? null,
    animeTitle: record.animeTitle,
    episodeTitle: record.episodeTitle ?? null,
    overview: record.overview ?? null,
    stillPath: record.stillPath ?? null,
    backdropPath: record.backdropPath ?? null,
    watched: !!record.watched,
    rating: record.rating ?? null,
    createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
    updatedAt: record.updatedAt ? new Date(record.updatedAt) : new Date(),
  };
}

export class EpisodeProgressService {
  async getByEpisodeKey(userId: string, episodeKey: string) {
    const prismaClient = getMongoClient();
    const result = await prismaClient.$runCommandRaw({
      find: 'episode_progress',
      filter: { userId, episodeKey },
      limit: 1,
    });

    const firstBatch = result?.cursor?.firstBatch || [];
    return normalizeRecord(firstBatch[0] ?? null);
  }

  async upsert(userId: string, input: EpisodeProgressInput) {
    const prismaClient = getMongoClient();
    const now = new Date();
    const existing = await this.getByEpisodeKey(userId, input.episodeKey);

    await prismaClient.$runCommandRaw({
      update: 'episode_progress',
      updates: [
        {
          q: { userId, episodeKey: input.episodeKey },
          u: {
            $set: {
              source: input.source,
              tmdbShowId: input.tmdbShowId ?? null,
              seasonNumber: input.seasonNumber ?? null,
              episodeNumber: input.episodeNumber ?? null,
              animeTitle: input.animeTitle,
              episodeTitle: input.episodeTitle ?? null,
              overview: input.overview ?? null,
              stillPath: input.stillPath ?? null,
              backdropPath: input.backdropPath ?? null,
              watched: input.watched ?? false,
              rating: input.rating ?? null,
              updatedAt: now,
            },
            $setOnInsert: {
              userId,
              episodeKey: input.episodeKey,
              createdAt: now,
            },
          },
          upsert: true,
        },
      ],
    });

    return (
      (await this.getByEpisodeKey(userId, input.episodeKey)) ||
      existing ||
      normalizeRecord({
        userId,
        episodeKey: input.episodeKey,
        source: input.source,
        tmdbShowId: input.tmdbShowId ?? null,
        seasonNumber: input.seasonNumber ?? null,
        episodeNumber: input.episodeNumber ?? null,
        animeTitle: input.animeTitle,
        episodeTitle: input.episodeTitle ?? null,
        overview: input.overview ?? null,
        stillPath: input.stillPath ?? null,
        backdropPath: input.backdropPath ?? null,
        watched: input.watched ?? false,
        rating: input.rating ?? null,
        createdAt: now,
        updatedAt: now,
      })
    );
  }
}

export const episodeProgressService = new EpisodeProgressService();
