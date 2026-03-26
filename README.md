# Miyache - Anime Streaming Platform com Painel Admin

Plataforma de streaming de animes com painel administrativo completo para gerenciamento de séries (CRUD) integrado ao TMDB.

## 🎯 Características

### Frontend
- ✅ Site público de animes (React + Vite + Tailwind CSS)
- ✅ Painel admin completo (`/admin`)
- ✅ Autenticação JWT com RBAC (admin/editor)
- ✅ CRUD de séries com importação do TMDB
- ✅ Sistema de overrides locais (título PT-BR, sinopse customizada)
- ✅ Controle de visibilidade (draft/published/archived)
- ✅ Sistema de destaque (featured) com ordenação
- ✅ Sincronização inteligente do TMDB (preserva overrides)
- ✅ Audit log de todas as ações

### Backend
- ✅ API REST com Node.js + Express + TypeScript
- ✅ Banco de dados SQLite com Prisma ORM
- ✅ Validação server-side com Zod
- ✅ Filtro de anime (keyword TMDB: 210024, gênero Animation, origem JP)
- ✅ Soft delete padrão (archived)
- ✅ Separação em camadas (routes → controllers → services → repositories)

## 🚀 Começando

### Pré-requisitos
- Node.js 18+ e npm
- Chave de API do TMDB ([obtenha aqui](https://www.themoviedb.org/settings/api))

### Instalação

1. **Clone o repositório** (se aplicável) ou navegue até a pasta do projeto

2. **Instale dependências do frontend e backend:**
```bash
npm install
cd server
npm install
cd ..
```

3. **Configure variáveis de ambiente:**

Crie `.env` no root:
```env
VITE_TMDB_API_KEY=sua_chave_tmdb
VITE_API_URL=http://localhost:3001
```

Crie `server/.env`:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev_secret_key_change_in_production"
TMDB_API_KEY=mesma_chave_do_frontend
CORS_ORIGIN="http://localhost:5173"
```

4. **Execute migrations do banco de dados:**
```bash
cd server
npx prisma migrate dev
npx prisma generate
```

5. **Seed do banco (cria usuários admin e editor):**
```bash
cd server
npm run prisma:seed
```

**Credenciais padrão:**
- Admin: `admin@miyache.com` / `admin123`
- Editor: `editor@miyache.com` / `editor123`

### Rodar em Desenvolvimento

**Opção 1: Rodar tudo junto (recomendado)**
```bash
npm run dev:all
```

**Opção 2: Rodar separadamente**

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
cd server
npm run dev
```

Acesse:
- **Site público:** http://localhost:5173
- **Painel admin:** http://localhost:5173/admin
- **API:** http://localhost:3001
- **Prisma Studio:** `npm run prisma:studio`

## 📁 Estrutura do Projeto

```
miyache/
├── src/                      # Frontend (React)
│   ├── admin/                # Painel admin (TypeScript)
│   │   ├── api/              # Hooks React Query
│   │   ├── components/       # Componentes admin
│   │   ├── pages/            # Páginas admin
│   │   ├── routes/           # Router admin
│   │   ├── schemas/          # Validação Zod
│   │   └── types/            # Types TypeScript
│   ├── components/           # Componentes site público
│   ├── pages/                # Páginas site público
│   ├── services/             # TMDB service
│   └── data/                 # Dados estáticos
│
├── server/                   # Backend (Node.js + TypeScript)
│   ├── prisma/
│   │   ├── schema.prisma     # Modelo de dados
│   │   └── seed.ts           # Seed do banco
│   └── src/
│       ├── config/           # Configurações (env, TMDB)
│       ├── db/               # Prisma client
│       ├── middlewares/      # Auth, validação, erros
│       ├── modules/
│       │   ├── auth/         # Autenticação JWT
│       │   ├── series/       # CRUD de séries
│       │   ├── tmdb/         # Proxy TMDB
│       │   └── audit/        # Audit logs
│       └── utils/            # Helpers
│
├── package.json              # Dependências frontend
├── server/package.json       # Dependências backend
├── tsconfig.json             # Config TypeScript global
└── README.md                 # Este arquivo
```

## 🔑 Principais Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login (retorna JWT)
- `GET /api/auth/me` - Dados do usuário autenticado

### Séries (requer autenticação)
- `GET /api/series` - Listar séries (com filtros)
- `GET /api/series/stats` - Estatísticas
- `GET /api/series/audit` - Audit logs recentes
- `POST /api/series` - Criar/Importar série
- `GET /api/series/:id` - Detalhes da série
- `PATCH /api/series/:id` - Atualizar overrides
- `POST /api/series/:id/publish` - Publicar
- `POST /api/series/:id/unpublish` - Despublicar
- `POST /api/series/:id/archive` - Arquivar
- `POST /api/series/:id/unarchive` - Desarquivar
- `POST /api/series/:id/sync` - Sincronizar do TMDB
- `DELETE /api/series/:id` - Deletar (apenas admin)

### TMDB (requer autenticação)
- `GET /api/tmdb/search?query=naruto` - Buscar animes
- `GET /api/tmdb/anime/:tmdbId` - Detalhes do anime

## 💡 Uso do Painel Admin

### 1. Login
Acesse `/admin/login` e entre com as credenciais:
- Email: `admin@miyache.com`
- Senha: `admin123`

### 2. Dashboard
- Visualize estatísticas de séries
- Veja atividade recente (audit logs)
- Acesse ações rápidas

### 3. Gerenciar Séries

**Importar do TMDB:**
1. Clique em "Nova Série"
2. Aba "Importar do TMDB"
3. Busque por título (ex: "Naruto")
4. Selecione o anime
5. Configure visibilidade e destaque
6. Clique em "Importar"

**Criar Manualmente:**
1. Clique em "Nova Série"
2. Aba "Criar Manualmente"
3. Preencha título, sinopse, etc.
4. Configure visibilidade
5. Clique em "Criar"

**Editar Série:**
1. Na lista, clique em "Editar"
2. **Dados TMDB:** Somente leitura (botão Sincronizar disponível)
3. **Overrides Locais:** Edite título PT-BR, sinopse customizada, tags
4. **Controles:** Altere visibilidade, marque como destaque
5. **Ações:** Publicar, Arquivar, Sincronizar, Deletar

### 4. Regras Importantes

**Sincronização TMDB:**
- Atualiza APENAS campos espelhados (title, overview, posterPath, etc.)
- **PRESERVA** overrides locais (titleOverride, overviewOverride, tagsJson)
- **NÃO altera** visibility, isFeatured, featuredOrder

**Visibilidade:**
- `draft` - Rascunho (não aparece no site)
- `published` - Publicado (visível no site)
- `archived` - Arquivado (soft delete)

**Destaque (Featured):**
- Marque `isFeatured = true`
- Defina `featuredOrder` (menor número = maior prioridade)
- Séries em destaque aparecem primeiro nas listagens

## 🗄️ Modelo de Dados

### User
- `id`, `email`, `passwordHash`, `role` (admin/editor)

### Series
**Campos TMDB (readonly no painel):**
- `tmdbId`, `title`, `originalTitle`, `overview`, `posterPath`, `backdropPath`, `genresJson`, `rating`, `releaseDate`, `status`

**Overrides Locais (editáveis):**
- `titleOverride` - Título personalizado PT-BR
- `overviewOverride` - Sinopse customizada
- `tagsJson` - Tags (JSON array)

**Controle:**
- `visibility` - draft | published | archived
- `isFeatured` - bool
- `featuredOrder` - int (ordem do destaque)
- `source` - tmdb | manual

### AuditLog
- Registra todas ações: create, import, update, sync, publish, archive, delete
- Guarda estado `beforeJson` e `afterJson`

## 🛠️ Scripts Úteis

```bash
# Frontend
npm run dev              # Dev server Vite
npm run build            # Build produção
npm run lint             # ESLint

# Backend
cd server
npm run dev              # Dev server (tsx watch)
npm run build            # Build TypeScript
npm run prisma:migrate   # Rodar migrations
npm run prisma:studio    # Abrir Prisma Studio
npm run prisma:seed      # Seed do banco

# Ambos
npm run dev:all          # Rodar front + back simultaneamente
```

## 🔧 Personalização

### Filtro de Anime
Ajuste em `server/src/config/tmdb.ts`:
```typescript
export const TMDB_CONFIG = {
  ANIME_FILTERS: {
    KEYWORD_ID: 210024,      // Keyword "anime"
    ANIMATION_GENRE_ID: 16,  // Gênero Animation
    ORIGIN_COUNTRY: 'JP',    // País Japão
  },
}
```

### Tema do Admin
CSS em `src/admin/admin.css` reutiliza variáveis do `src/index.css`:
- `--primary`, `--bg-primary`, `--text-primary`, etc.

### RBAC (Roles)
- **Admin:** Acesso total (incluindo DELETE)
- **Editor:** CRUD exceto DELETE

## 🚨 Troubleshooting

**Erro ao conectar API:**
- Verifique se o backend está rodando (`npm run dev:server`)
- Confirme `VITE_API_URL=http://localhost:3001` no `.env`
- Verifique CORS em `server/src/config/env.ts`

**Erro de autenticação:**
- Limpe localStorage: `localStorage.clear()`
- Verifique JWT_SECRET no `server/.env`
- Execute seed novamente se usuários não existem

**Prisma errors:**
```bash
cd server
rm -rf prisma/migrations
rm dev.db
npx prisma migrate dev --name init
npm run prisma:seed
```

## 📝 Próximos Passos (Produção)

1. **Variáveis de ambiente:** Trocar `JWT_SECRET`, usar database URL real
2. **Database:** Migrar de SQLite para PostgreSQL/MySQL
3. **Deploy:** Frontend (Vercel/Netlify), Backend (Railway/Render)
4. **Auth:** Considerar refresh tokens, httpOnly cookies
5. **Validação:** Rate limiting, sanitização de inputs
6. **Monitoramento:** Logs estruturados, error tracking (Sentry)

## 📄 Licença

ISC

---

**Desenvolvido com ❤️ para gerenciamento profissional de animes**
Miyache
A new anime tracker
