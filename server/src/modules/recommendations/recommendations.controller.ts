import { Request, Response } from 'express';
import { recommendationsService } from './recommendations.service.js';
import { success, error } from '../../utils/apiResponse.js';

export class RecommendationsController {
  async getRecommendations(req: Request, res: Response) {
    try {
      const nick = req.query.nick as string;
      if (!nick) {
        return res.status(400).json(error('VALIDATION', 'Query parameter "nick" is required.'));
      }
      
      const result = await recommendationsService.getRecommendations(nick);
      res.json(success(result));
    } catch (err: any) {
      res.status(500).json(error('SERVER_ERROR', err.message));
    }
  }
}

export const recommendationsController = new RecommendationsController();
