import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../common/utils/response.util';
import { ExaminationsService } from './examinations.service';
import { GradingCriteriaService } from './grading-criteria.service';
import { SchedulingService } from './scheduling.service';
import { ExamRepository } from './examinations.repository';

export class ExaminationsController {
  constructor(
    private readonly examinationsService: ExaminationsService,
    private readonly schedulingService: SchedulingService,
    private readonly gradingCriteriaService: GradingCriteriaService,
    private readonly examRepository: ExamRepository
  ) {}

  // POST /api/v1/exams
  createExam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const exam = await this.examinationsService.createExam(req.body);
      sendSuccess(res, exam, 201, 'Examination created successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/exams
  listExams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        name: req.query.name as string,
        academicYear: (req.query.academicYear || req.query.academicYearId) as string,
        examType: (req.query.examType || req.query.examTypeId) as string,
        examPeriod: (req.query.examPeriod || req.query.examPeriodId) as string,
        classId: req.query.classId as string,
        sectionId: req.query.sectionId as string,
        status: req.query.status as any,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      };
      const pagination = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20
      };
      const result = await this.examinationsService.listExams(filters, pagination);
      sendSuccess(res, result.data, 200, 'Examinations retrieved successfully', result.meta);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/exams/:id
  getExamById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.id || req.params.examId;
      const exam = await this.examinationsService.getExamById(examId);
      const schedules = await this.schedulingService.listSchedules(examId);
      sendSuccess(
        res,
        { ...exam, schedules },
        200,
        'Examination details retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/exams/:id/schedules
  createSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.id || req.params.examId;
      const changedBy = (req as any).user?.name || (req as any).user?.id || 'System';
      const schedule = await this.schedulingService.createSchedule(examId, req.body, changedBy);
      sendSuccess(res, schedule, 201, 'Examination schedule created successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/exams/:id/schedules
  listSchedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const examId = req.params.id || req.params.examId;
      const schedules = await this.schedulingService.listSchedules(examId);
      sendSuccess(res, schedules, 200, 'Examination schedules retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/exams/grading-criteria
  createGradingCriteria = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config = this.gradingCriteriaService.createGradingConfig(req.body);
      sendSuccess(res, config, 201, 'Grading criteria configured successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/exams/grading-criteria
  listGradingCriteria = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const configs = this.gradingCriteriaService.listConfigs();
      sendSuccess(res, configs, 200, 'Grading criteria retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/exams/rooms
  listRooms = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rooms = await this.examRepository.listRooms();
      sendSuccess(res, rooms, 200, 'Examination rooms retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
