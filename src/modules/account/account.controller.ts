import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../common/errors/app-error';
import { sendSuccess } from '../../common/utils/response.util';
import { AccountService } from './account.service';

export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new UnauthorizedError('User authentication required');
      }
      const profile = await this.accountService.getProfile(req.user.id);
      sendSuccess(res, profile, 200);
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new UnauthorizedError('User authentication required');
      }
      const profile = await this.accountService.updateProfile(req.user.id, req.body);
      sendSuccess(res, profile, 200);
    } catch (err) {
      next(err);
    }
  };

  getPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new UnauthorizedError('User authentication required');
      }
      const preferences = await this.accountService.getPreferences(req.user.id);
      sendSuccess(res, preferences, 200);
    } catch (err) {
      next(err);
    }
  };

  updatePreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new UnauthorizedError('User authentication required');
      }
      const preferences = await this.accountService.updatePreferences(req.user.id, req.body);
      sendSuccess(res, preferences, 200);
    } catch (err) {
      next(err);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new UnauthorizedError('User authentication required');
      }
      const result = await this.accountService.changePassword(req.user.id, req.body);
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  };
}
