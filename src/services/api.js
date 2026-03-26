import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:3001/api', // Servidor backend rodando na porta 3001
});

// Interceptor para adicionar o token JWT
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },
    register: async (email, password) => {
        const response = await api.post('/auth/register', { email, password });
        return response.data;
    },
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};

export const userAnimeService = {
    resolveNick: async () => {
        const response = await api.get('/auth/me');
        const me = response?.data?.data || response?.data || {};
        return me.email || me.nick || null;
    },
    normalizeStatusFlags: (status) => {
        const watched = status === 'watched';
        const liked = watched || status === 'watchLater';
        return { watched, liked };
    },
    getAnimes: async () => {
        const nick = await userAnimeService.resolveNick();
        if (!nick) {
            throw new Error('Não foi possível identificar o usuário autenticado.');
        }

        const [tmdbRes, anilistRes] = await Promise.all([
            api.get(`/users/${encodeURIComponent(nick)}/anime`),
            api.get(`/users/${encodeURIComponent(nick)}/anilist`)
        ]);

        const tmdbList = tmdbRes?.data?.data || [];
        const aniList = anilistRes?.data?.data || [];

        const watched = [
            ...tmdbList.filter((item) => item.watched),
            ...aniList.filter((item) => item.watched).map((item) => ({
                id: item.id,
                anilistId: item.anilistId,
                title: item.title,
                posterUrl: item.posterUrl,
                score: item.score,
                genres: item.genres || [],
                source: 'anilist',
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                rating: item.score ?? null
            }))
        ];

        const watchLater = [
            ...tmdbList.filter((item) => !item.watched),
            ...aniList.filter((item) => !item.watched).map((item) => ({
                id: item.id,
                anilistId: item.anilistId,
                title: item.title,
                posterUrl: item.posterUrl,
                score: item.score,
                genres: item.genres || [],
                source: 'anilist',
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                rating: item.score ?? null
            }))
        ];

        return { success: true, data: { watched, watchLater } };
    },
    upsertAnime: async (tmdbId, title, status, posterPath = null) => {
        const nick = await userAnimeService.resolveNick();
        if (!nick) {
            throw new Error('Não foi possível identificar o usuário autenticado.');
        }

        const { watched, liked } = userAnimeService.normalizeStatusFlags(status);

        const response = await api.post(`/users/${encodeURIComponent(nick)}/anime`, {
            tmdbId,
            title,
            posterPath,
            genreIds: [],
            watched,
            liked
        });
        return response.data;
    },
    getRecommendations: async () => {
        const nick = await userAnimeService.resolveNick();
        if (!nick) {
            throw new Error('Não foi possível identificar o usuário autenticado.');
        }

        const response = await api.get('/recommendations', {
            params: { nick }
        });
        return response.data;
    },
    upsertAniListAnime: async (anilistId, title, status, payload = {}) => {
        const nick = await userAnimeService.resolveNick();
        if (!nick) {
            throw new Error('Não foi possível identificar o usuário autenticado.');
        }

        const { watched, liked } = userAnimeService.normalizeStatusFlags(status);

        const response = await api.post(`/users/${encodeURIComponent(nick)}/anilist`, {
            anilistId,
            title,
            synopsis: payload.synopsis ?? null,
            posterUrl: payload.posterUrl ?? null,
            bannerUrl: payload.bannerUrl ?? null,
            score: payload.score ?? null,
            genres: payload.genres ?? [],
            watched,
            liked
        });

        return response.data;
    }
};

export const episodeProgressService = {
    getProgress: async (episodeKey) => {
        const response = await api.get(`/episode-progress/${encodeURIComponent(episodeKey)}`);
        return response.data?.data ?? null;
    },
    upsertProgress: async (episodeKey, payload) => {
        const response = await api.put(`/episode-progress/${encodeURIComponent(episodeKey)}`, payload);
        return response.data?.data ?? null;
    }
};
