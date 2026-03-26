import { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { success, error } from '../../utils/apiResponse.js';
import { LoginInput, RegisterInput } from './auth.schemas.js';

export class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req: Request, res: Response) {
    try {
      const input = req.body as RegisterInput;
      const result = await authService.register(input);
      res.status(201).json(success(result));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar usuário';
      res.status(400).json(error('REGISTRATION_FAILED', message));
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response) {
    try {
      const input = req.body as LoginInput;
      const result = await authService.login(input);
      res.json(success(result));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login';
      res.status(401).json(error('AUTH_FAILED', message));
    }
  }

  /**
   * GET /api/auth/me
   */
  async getMe(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json(error('UNAUTHORIZED', 'Não autenticado'));
      }

      const user = await authService.getMe(req.user.userId);
      res.json(success(user));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar usuário';
      res.status(404).json(error('USER_NOT_FOUND', message));
    }
  }
}

export const authController = new AuthController();
