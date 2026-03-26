import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { error } from '../utils/apiResponse.js';

/**
 * Middleware de validação Zod
 * Valida req.body contra um schema Zod
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json(
          error('VALIDATION_ERROR', 'Dados inválidos', err.errors)
        );
      }
      next(err);
    }
  };
}

/**
 * Middleware de validação Zod para query params
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json(
          error('VALIDATION_ERROR', 'Query params inválidos', err.errors)
        );
      }
      next(err);
    }
  };
}
