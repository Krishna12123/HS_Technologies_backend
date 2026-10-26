import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../common/utils/response.util';
import { SettingsService } from './settings.service';

export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = req.query.category as string | undefined;
      const settings = await this.settingsService.getAllSettings(category);
      sendSuccess(res, settings, 200);
    } catch (err) {
      next(err);
    }
  };

  getByKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.params.key;
      const setting = await this.settingsService.getSettingRecord(key);
      sendSuccess(res, setting, 200);
    } catch (err) {
      next(err);
    }
  };

  updateByKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.params.key;
      const { value } = req.body;
      const updatedBy = req.user?.id;
      const setting = await this.settingsService.updateSetting(key, value, updatedBy);
      sendSuccess(res, setting, 200);
    } catch (err) {
      next(err);
    }
  };

  bulkUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updatedBy = req.user?.id;
      const settings = await this.settingsService.bulkUpdateSettings(req.body, updatedBy);
      sendSuccess(res, settings, 200);
    } catch (err) {
      next(err);
    }
  };

  getSchoolProfile = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.settingsService.getSchoolProfile();
      sendSuccess(res, profile, 200);
    } catch (err) {
      next(err);
    }
  };

  updateSchoolProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updatedBy = req.user?.id;
      const profile = await this.settingsService.updateSchoolProfile(req.body, updatedBy);
      sendSuccess(res, profile, 200);
    } catch (err) {
      next(err);
    }
  };
}
