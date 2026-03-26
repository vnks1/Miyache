import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/apiResponse.js';

/**
 * Error handler global
 * Captura erros não tratados e retorna resposta padronizada
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('❌ Error:', err);

  // Erro já foi tratado
  if (res.headersSent) {
    return next(err);
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json(
      error('DATABASE_ERROR', 'Erro na operação do banco de dados')
    );
  }

  // Default
  res.status(500).json(
    error('INTERNAL_ERROR', 'Erro interno do servidor', 
      process.env.NODE_ENV === 'development' ? err.message : undefined
    )
  );
}
