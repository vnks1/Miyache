import { Request, Response } from 'express';
import { usersService } from './users.service.js';
import { success, error } from '../../utils/apiResponse.js';

export class UsersController {
  async createUser(req: Request, res: Response) {
    try {
      const { nick } = req.body;
      if (!nick) return res.status(400).json(error('VALIDATION', 'Nick is required.'));
      
      const user = await usersService.findOrCreateUserByNick(nick);
      res.status(201).json(success(user));
    } catch (err: any) {
      res.status(500).json(error('SERVER_ERROR', err.message));
    }
  }

  async saveAnime(req: Request, res: Response) {
    try {
      const { nick } = req.params;
      const data = req.body;
      
      if (!data.tmdbId || !data.title) {
        return res.status(400).json(error('VALIDATION', 'tmdbId and title are required.'));
      }
      
      const saved = await usersService.saveAnime(nick, data);
      res.status(201).json(success(saved));
    } catch (err: any) {
      if (err.name === 'PrismaClientValidationError') {
        res.status(400).json(error('VALIDATION', 'Invalid data format provided.'));
      } else {
        res.status(500).json(error('SERVER_ERROR', err.message));
      }
    }
  }

  async getSavedAnime(req: Request, res: Response) {
    try {
      const { nick } = req.params;
      const history = await usersService.getSavedAnime(nick);
      res.json(success(history));
    } catch (err: any) {
      res.status(500).json(error('SERVER_ERROR', err.message));
    }
  }

  async saveAniListAnime(req: Request, res: Response) {
    try {
      const { nick } = req.params;
      const data = req.body;

      if (!data.anilistId || !data.title) {
        return res.status(400).json(error('VALIDATION', 'anilistId and title are required.'));
      }

      const saved = await usersService.saveAniListAnime(nick, data);
      res.status(201).json(success(saved));
    } catch (err: any) {
      if (err.name === 'PrismaClientValidationError') {
        res.status(400).json(error('VALIDATION', 'Invalid data format provided.'));
      } else {
        res.status(500).json(error('SERVER_ERROR', err.message));
      }
    }
  }

  async getSavedAniListAnime(req: Request, res: Response) {
    try {
      const { nick } = req.params;
      const history = await usersService.getSavedAniListAnime(nick);
      res.json(success(history));
    } catch (err: any) {
      res.status(500).json(error('SERVER_ERROR', err.message));
    }
  }
}

export const usersController = new UsersController();
