# Fase 0 - Auditoria TMDB (Projeto Atual)

## 0.1 Mapeamento de uso do TMDB

### Variáveis e configuração
- `.env.example:3` -> `VITE_TMDB_API_KEY`
- `server/.env.example:11` -> `TMDB_API_KEY`
- `src/services/tmdb.js:1-3` -> `VITE_TMDB_API_KEY`, `https://api.themoviedb.org/3`, `https://image.tmdb.org/t/p`
- `server/src/config/tmdb.ts:7-8` -> base URL da API e base de imagens TMDB
- `server/src/config/env.ts:9,14-15` -> leitura/aviso de `TMDB_API_KEY`

### Endpoints TMDB chamados no frontend
Arquivo principal: `src/services/tmdb.js`

- `/search/tv`
  - `src/services/tmdb.js:18`
  - `src/services/tmdb.js:279`
  - `src/services/tmdb.js:468`
- `/tv/{id}` (+ `append_to_response=keywords`)
  - `src/services/tmdb.js:96`
- `/tv/{id}/season/{seasonNumber}`
  - `src/services/tmdb.js:125`
- `/tv/{id}/season/{seasonNumber}/episode/{episodeNumber}`
  - `src/services/tmdb.js:154`
- `/tv/{id}/similar`
  - `src/services/tmdb.js:191`
- `/discover/tv`
  - `src/services/tmdb.js:369`
  - `src/services/tmdb.js:494`
  - `src/services/tmdb.js:608`
  - `src/services/tmdb.js:639`
  - `src/services/tmdb.js:670`
  - `src/services/tmdb.js:713`
- `/genre/tv/list`
  - `src/services/tmdb.js:425`

### Endpoints TMDB chamados no backend
Arquivo principal: `server/src/modules/tmdb/tmdb.service.ts`

- `/search/tv`
  - `server/src/modules/tmdb/tmdb.service.ts:26`
- `/tv/{tmdbId}`
  - `server/src/modules/tmdb/tmdb.service.ts:44`
- `/discover/tv`
  - `server/src/modules/tmdb/tmdb.service.ts:112`
  - `server/src/modules/tmdb/tmdb.service.ts:125`

### APIs internas que dependem de TMDB
- `GET /api/tmdb/search`
  - `server/src/server.ts:27,52`
  - `server/src/modules/tmdb/tmdb.routes.ts:10-11`
  - `src/admin/api/tmdb.ts:10`
- `GET /api/tmdb/anime/:tmdbId`
  - `server/src/server.ts:27,53`
  - `server/src/modules/tmdb/tmdb.routes.ts:13-14`
  - `src/admin/api/tmdb.ts:24-25`

### Componentes/páginas que consomem campos TMDB
- `src/pages/AnimeDetailPage.jsx`
  - Usa `name`, `genres[].id`, `poster_path`, `first_air_date`, `vote_average`, `seasons[]`, `id`, `overview`
- `src/pages/EpisodeDetailPage.jsx`
  - Usa `season_number`, `episode_number`, `name`, `air_date`, `vote_average`, `still_path`, `overview`
- `src/components/AnimeHero.jsx`
  - Usa `backdrop_path`, `poster_path`, `vote_average`, `first_air_date`, `name`, `overview`, `genres`
- `src/components/Header.jsx` e `src/components/SearchAnime.jsx`
  - Usa `poster_path`, `name/title`, `first_air_date`, `overview`, `vote_average`
- `src/components/EpisodeCard.jsx`
  - Usa `still_path`, `name`, `season_number`, `episode_number`
- `src/pages/ProfilePage.jsx`
  - Monta URL de imagem com `https://image.tmdb.org/t/p/w500${posterPath}`

### Modelo de dados/contratos que carregam “tmdb”
- Front admin
  - `src/admin/types/api.types.ts` (`tmdbId`, `source: 'tmdb' | 'manual'`)
  - `src/admin/schemas/series.schemas.ts` (`source: 'tmdb'`, `tmdbId`)
  - `src/admin/pages/SeriesCreatePage.tsx` (fluxo de import TMDB)
- Backend e banco
  - `server/prisma/schema.prisma` (`tmdbId`, `source`)
  - `server/src/modules/series/*` (import/sync com `tmdbService`)
  - `server/src/modules/recommendations/recommendations.service.ts` (usa `tmdbService`)

## 0.2 Comparativo de campos (TMDB -> AniList) para este projeto

- `id` -> `id`
- `name` / `title` / `original_name` -> `title.english` ou `title.romaji`
- `overview` -> `description` (limpar HTML quando necessário)
- `poster_path` -> `coverImage.large` (URL completa)
- `backdrop_path` -> `bannerImage` (quando existir)
- `vote_average` (0-10) -> `averageScore / 10` (AniList vem 0-100)
- `first_air_date` -> `startDate` (`year`, `month`, `day`)
- `genres[].name` / `genre_ids` -> `genres[]` (texto) e/ou `genres` mapeado para filtros
- `status` (TMDB) -> `status` (AniList, enum próprio)
- `season_number`, `episode_number`, `air_date`, `still_path` -> depende da modelagem de episódios em AniList (não é 1:1 com TMDB TV episodes)

## Risco identificado já na Fase 0
- O projeto usa TMDB em 3 frentes ao mesmo tempo:
  - Front público (`src/services/tmdb.js` + páginas/componentes)
  - Admin (`/api/tmdb/*`)
  - Backend/recomendações/sincronização (`tmdbService` + banco com `tmdbId`)
- A migração precisa ser em camadas, sem quebrar o fluxo atual de importação/admin e recomendações.

## Próximo passo (Fase 1)
1. Criar camada abstrata nova em `src/services/api/` (types, client, queries, mappers, media.service).
2. Manter `src/services/tmdb.js` intacto temporariamente.
3. Migrar primeiro a listagem (Home/Explore), depois busca, depois detalhes.
