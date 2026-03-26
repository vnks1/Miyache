# Fase 4 - Limpeza Final (Controlada)

Data: 25/03/2026

## Concluído no frontend público
- Home (`src/pages/HomePage.jsx`) agora usa apenas AniList para destaque, seções e recomendações visuais.
- Busca global (`src/components/Header.jsx`) agora usa apenas AniList.
- Componente de busca (`src/components/SearchAnime.jsx`) agora usa apenas AniList.
- Explorar (`src/pages/ExplorePage.jsx`) agora usa apenas AniList (sem fallback TMDB).
- Recomendação (`src/services/recommendationApi.ts`) agora prioriza apenas AniList e remove fallback para endpoint legado TMDB.
- Arquivo legado removido: `src/data/animeData.js`.

## Legado mantido de forma deliberada
- Detalhes/episódios ainda com suporte TMDB híbrido:
  - `src/pages/AnimeDetailPage.jsx`
  - `src/pages/EpisodeDetailPage.jsx`
  - `src/services/tmdb.js`
- Admin/backoffice ainda TMDB-based:
  - `src/admin/**`
  - `server/src/modules/tmdb/**`
  - `server/src/modules/series/**` (fluxos de import/sync)

## Resultado prático
- Frontend público principal está AniList-first.
- TMDB ficou isolado a fluxos legados específicos (episódios e backoffice), reduzindo risco de regressão.

## Pendências para zerar TMDB por completo
1. Migrar fonte de episódios/detalhes avançados para provider compatível (ou descontinuar navegação por episódio baseada em TMDB).
2. Migrar admin de import/sync para AniList.
3. Remover módulo TMDB do backend e variáveis de ambiente TMDB após os itens 1 e 2.
