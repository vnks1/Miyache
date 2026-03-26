import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import episodeProgressRoutes from './modules/episode-progress/episode-progress.routes.js';
import seriesRoutes from './modules/series/series.routes.js';
import tmdbRoutes from './modules/tmdb/tmdb.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import recommendationsRoutes from './modules/recommendations/recommendations.routes.js';
import { success } from './utils/apiResponse.js';

const app = express();

// Middlewares globais
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json(success({ status: 'ok', timestamp: new Date().toISOString() }));
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/episode-progress', episodeProgressRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/tmdb', tmdbRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/recommendations', recommendationsRoutes);

// Error handler (deve ser o último middleware)
app.use(errorHandler);

// Iniciar servidor
const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 CORS origin: ${env.CORS_ORIGIN}`);
  console.log(`\n📚 API Endpoints:`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/auth/me`);
  console.log(`   GET    /api/episode-progress/:episodeKey`);
  console.log(`   PUT    /api/episode-progress/:episodeKey`);
  console.log(`   GET    /api/series`);
  console.log(`   POST   /api/series`);
  console.log(`   GET    /api/series/:id`);
  console.log(`   PATCH  /api/series/:id`);
  console.log(`   POST   /api/series/:id/archive`);
  console.log(`   POST   /api/series/:id/publish`);
  console.log(`   POST   /api/series/:id/sync`);
  console.log(`   DELETE /api/series/:id`);
  console.log(`   GET    /api/tmdb/search`);
  console.log(`   GET    /api/tmdb/anime/:tmdbId`);
  console.log(`\n✅ Ready to accept requests!`);
});

export default app;
