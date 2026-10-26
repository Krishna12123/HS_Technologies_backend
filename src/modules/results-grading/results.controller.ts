import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../common/utils/response.util';
import { ReportCardService } from './report-card.service';
import { ResultPublishingService } from './result-publishing.service';
import { ResultsRepository } from './results.repository';
import { ResultsService } from './results.service';

export class ResultsController {
  constructor(
    private readonly resultsService: ResultsService,
    private readonly publishingService: ResultPublishingService,
    private readonly reportCardService: ReportCardService,
    private readonly resultsRepository: ResultsRepository
  ) {}

  // POST /api/v1/exams/:id/marks
  submitMarks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.id;
      const enteredBy = (req as any).user?.name || (req as any).user?.id || 'Teacher';
      const record = await this.resultsService.submitMarks(examId, req.body, enteredBy);
      sendSuccess(res, record, 201, 'Marks submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/exams/:id/marks
  getMarks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.id;
      const studentId = req.query.studentId as string;
      const subjectId = req.query.subjectId as string;
      const records = await this.resultsService.getMarks(examId, studentId, subjectId);
      sendSuccess(res, records, 200, 'Marks retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/results/:id/publish
  publishResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resultId = req.params.id;
      const actor = (req as any).user?.name || (req as any).user?.id || 'Admin';
      const published = await this.publishingService.publishResult(resultId, actor);
      sendSuccess(res, published, 200, 'Result published successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/exams/:id/results/student/:studentId
  getStudentReportCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.id;
      const studentId = req.params.studentId;
      const report = await this.reportCardService.generateStudentReportCard(examId, studentId);
      sendSuccess(res, report, 200, 'Student report card retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/exams/:id/grace-policy
  configureGracePolicy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.id;
      await this.resultsRepository.setGracePolicy(req.body, examId);
      sendSuccess(res, req.body, 200, 'Grace marks policy configured successfully');
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/v1/results/marks/:marksId
  correctMarks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const marksId = req.params.marksId;
      const actor = (req as any).user?.name || (req as any).user?.id || 'Admin';
      const updated = await this.resultsService.correctMarks(marksId, req.body, actor);
      sendSuccess(res, updated, 200, 'Marks updated via authorized correction workflow');
    } catch (error) {
      next(error);
    }
  };
}
