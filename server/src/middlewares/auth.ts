import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { error } from '../utils/apiResponse.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware de autenticação JWT
 * Extrai e valida o token do header Authorization
 */
export function authJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(error('UNAUTHORIZED', 'Token não fornecido'));
  }

  const token = authHeader.substring(7); // Remove "Bearer "

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json(error('INVALID_TOKEN', 'Token inválido ou expirado'));
  }
}

/**
 * Middleware de autorização por role
 * Usa após authJWT
 */
export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(error('UNAUTHORIZED', 'Usuário não autenticado'));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        error('FORBIDDEN', `Acesso negado. Requer role: ${roles.join(' ou ')}`)
      );
    }

    next();
  };
}
