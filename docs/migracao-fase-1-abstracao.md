# Fase 1 - Camada de Serviço (Abstração)

Status: concluída (base pronta, sem substituir componentes ainda).

## Estrutura criada
- `src/services/api/anilist/client.js`
- `src/services/api/anilist/queries.js`
- `src/services/api/anilist/mappers.js`
- `src/services/api/media.service.js`
- `src/services/api/types.js`

## O que cada arquivo faz
- `client.js`: centraliza requisição GraphQL para AniList, com tratamento de erro HTTP e rate limit (`429`).
- `queries.js`: concentra queries GraphQL de listagem popular, busca e detalhes.
- `mappers.js`: normaliza retorno AniList para formato interno do projeto.
- `media.service.js`: interface única para os componentes (`getPopularMedia`, `searchMedia`, `getMediaById`).
- `types.js`: typedefs JSDoc para `Media` e `SearchResult`.

## Interface interna atual (normalizada)
- `id`
- `title`
- `synopsis`
- `posterUrl`
- `score` (sempre 0-10)
- `genres`
- `releaseYear`
- `bannerUrl`
- `status`
- `format`
- `episodes`

## Validação
- Build executado com sucesso em `2026-03-25` via `npm run build`.

## Próximo passo (Fase 2)
- Migrar componente por componente para consumir `media.service.js`.
- Ordem recomendada: listagem -> busca -> detalhes.

## Fase 2 - andamento inicial
- `src/pages/HomePage.jsx`:
  - seção **Populares** já consome AniList via `getPopularMedia(1, 20)`;
  - adicionada normalização para formato de `AnimeCard`;
  - mantido fallback para a lista antiga local em caso de erro.
- `src/components/Header.jsx`:
  - busca principal migrada para `searchMedia`;
  - fallback para TMDB quando AniList falha;
  - navegação de resultado AniList por título codificado (evita colisão de IDs com TMDB).
- `src/components/SearchAnime.jsx`:
  - componente migrado para `searchMedia` com fallback TMDB;
  - adaptado para novo formato normalizado de resultados.
- `src/pages/AnimeDetailPage.jsx`:
  - fluxo híbrido implementado:
    - mantém TMDB por ID numérico (com episódios);
    - usa AniList por título quando aplicável;
    - mantém fallback TMDB por título para rotas legadas.
- `src/components/AnimeHero.jsx`:
  - compatível com dados TMDB e AniList;
  - proteção para não salvar conteúdo AniList no fluxo atual de `tmdbId`.
- `src/pages/ExplorePage.jsx`:
  - listagem migrada para AniList (`getPopularMedia` / `searchMedia`);
  - filtros de gênero, ano, temporada, formato e status aplicados no cliente;
  - fallback para TMDB mantido em caso de falha AniList.
- Persistência AniList separada (backend):
  - novo model `UserAniListAnime` em `server/prisma/schema.prisma`;
  - novos endpoints:
    - `POST /api/users/:nick/anilist`
    - `GET /api/users/:nick/anilist`
  - `users.service` e `users.controller` atualizados para salvar/listar AniList sem interferir no fluxo TMDB legado.
- Integração frontend de save AniList:
  - `src/services/api.js`: novo `userAnimeService.upsertAniListAnime(...)`;
  - `src/components/AnimeHero.jsx`: save AniList habilitado usando o endpoint novo.
- Alinhamento de rotas e perfil:
  - `src/services/api.js` ajustado para usar rotas reais `/api/users/:nick/...` e `/api/recommendations?nick=...`;
  - `src/pages/ProfilePage.jsx` agora aceita itens TMDB e AniList na mesma listagem;
  - `src/components/AnimeCard.jsx` respeita `source: 'anilist'` para navegação por título.
- Recomendações no frontend (prioridade AniList):
  - `src/services/recommendationApi.ts` agora tenta gerar recomendações AniList com base em animes AniList salvos (gêneros), com fallback para endpoint legado;
  - `src/components/RecommendationCard.tsx` aceita imagem/nota de TMDB e AniList;
  - `src/components/RecommendationRow.tsx` chave de renderização compatível com IDs AniList/TMDB.
- `src/pages/EpisodeDetailPage.jsx`:
  - fluxo híbrido implementado:
    - mantém experiência completa de episódios via TMDB quando existe contexto de temporada/episódio;
    - fallback AniList amigável quando a rota não possui dados de episódio TMDB.
