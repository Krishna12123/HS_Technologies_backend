import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../common/utils/response.util';
import { ResultsService } from './results.service';

export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const changedBy = req.user?.id;
      const schoolId = req.user?.schoolId;
      const result = await this.resultsService.createResult(
        { ...req.body, schoolId: req.body.schoolId || schoolId },
        changedBy
      );
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  };

  bulkCreate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const changedBy = req.user?.id;
      const results = await this.resultsService.bulkCreateResults(req.body, changedBy);
      sendSuccess(res, results, 201);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, examId, studentId, subjectId, status } = req.query as any;
      const schoolId = req.user?.schoolId;

      const paginated = await this.resultsService.listResults(
        { examId, studentId, subjectId, status, schoolId },
        { page: Number(page) || 1, limit: Number(limit) || 20 }
      );

      sendSuccess(res, paginated.items, 200, {
        pagination: paginated.pagination
      });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { resultId } = req.params;
      const result = await this.resultsService.getResultById(resultId);
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { resultId } = req.params;
      const changedBy = req.user?.id;
      const userRole = req.user?.role;
      const result = await this.resultsService.updateResult(resultId, req.body, changedBy, userRole);
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  };

  publish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { resultId } = req.params;
      const changedBy = req.user?.id;
      const userRole = req.user?.role;
      const result = await this.resultsService.publishResult(resultId, changedBy, userRole);
      sendSuccess(res, result, 200);
    } catch (err) {
      next(err);
    }
  };

  getByStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId } = req.params;
      const examId = req.query.examId as string | undefined;
      const results = await this.resultsService.getStudentResults(studentId, examId);
      sendSuccess(res, results, 200);
    } catch (err) {
      next(err);
    }
  };

  getByExam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { examId } = req.params;
      const results = await this.resultsService.getExamResults(examId);
      sendSuccess(res, results, 200);
    } catch (err) {
      next(err);
    }
  };

  getReportCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId } = req.params;
      const examId = req.query.examId as string;
      const reportCard = await this.resultsService.getStudentReportCard(studentId, examId);
      sendSuccess(res, reportCard, 200);
    } catch (err) {
      next(err);
    }
  };
}
