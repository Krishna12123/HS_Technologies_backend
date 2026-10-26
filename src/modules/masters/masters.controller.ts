import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../common/utils/response.util';
import { MastersService } from './masters.service';

export class MastersController {
  constructor(private readonly mastersService: MastersService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = req.params.category;
      const { page, limit, status, search } = req.query as any;
      const schoolId = req.user?.schoolId;

      const result = await this.mastersService.listMasterRecords(
        category,
        { status, search, schoolId },
        { page: Number(page) || 1, limit: Number(limit) || 50 }
      );

      sendSuccess(res, result.items, 200, {
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, id } = req.params;
      const record = await this.mastersService.getMasterRecord(category, id);
      sendSuccess(res, record, 200);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category } = req.params;
      const schoolId = req.user?.schoolId || 'SCH-001';
      const record = await this.mastersService.createMasterRecord(category, req.body, schoolId);
      sendSuccess(res, record, 201);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, id } = req.params;
      const record = await this.mastersService.updateMasterRecord(category, id, req.body);
      sendSuccess(res, record, 200);
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, id } = req.params;
      const { status } = req.body;
      const record = await this.mastersService.updateStatus(category, id, status);
      sendSuccess(res, record, 200);
    } catch (err) {
      next(err);
    }
  };
}
