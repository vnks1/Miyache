# Fase 3 - Erros, Rate Limit e Cache

Status: parcialmente concluída (itens compatíveis com Vite/React já implementados).

## Implementado
- `src/services/api/anilist/client.js`
  - Classe `ApiRequestError` com `code` padronizado:
    - `rate_limit`
    - `http_error`
    - `network_error`
    - `graphql_error`
    - `unknown`
  - Tratamento explícito de `429` com mensagem de retry.
  - Tratamento de falha de rede e erro GraphQL.

- `src/services/api/media.service.js`
  - Cache em memória com TTL para reduzir chamadas repetidas:
    - Popular: 1h
    - Busca: 5min
    - Detalhes: 24h
  - Normalização de erros para `ApiRequestError`.

- `src/pages/HomePage.jsx`
  - Tratamento amigável de erro na seção "Populares" quando AniList falha.
  - Fallback preservado para lista local existente.

## Pendente (por diferença de stack)
- O plano original cita cache com `next: { revalidate }` (Next.js App Router).
- Projeto atual está em Vite/React SPA, então `revalidate` não se aplica diretamente.
- Equivalente já aplicado: cache em memória no service layer.
