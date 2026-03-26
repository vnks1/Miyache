import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || '3001',
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret',
  TMDB_API_KEY: process.env.TMDB_API_KEY || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
} as const;

// Validação de variáveis críticas
if (!env.TMDB_API_KEY && env.NODE_ENV === 'production') {
  console.warn('⚠️  TMDB_API_KEY não configurada!');
}

if (env.JWT_SECRET === 'dev_secret' && env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET deve ser alterado em produção!');
}
