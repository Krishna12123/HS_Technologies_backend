import { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../common/utils/response.util';
import { AcademicsService } from './academics.service';

export class AcademicsController {
  constructor(private readonly academicsService: AcademicsService) {}

  // POST /api/v1/academics/subjects
  createSubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subject = await this.academicsService.createSubject(req.body);
      sendSuccess(res, subject, 201, 'Subject created successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/academics/subjects
  listSubjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        type: req.query.type as any,
        status: req.query.status as any,
        search: req.query.search as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20
      };
      const result = await this.academicsService.listSubjects(filters);
      sendSuccess(res, result.data, 200, 'Subjects retrieved successfully', result.meta);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/academics/subjects/:id
  getSubjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subject = await this.academicsService.getSubjectById(req.params.id);
      sendSuccess(res, subject, 200, 'Subject details retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/academics/syllabus
  createSyllabus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const syllabus = await this.academicsService.createSyllabus(req.body);
      sendSuccess(res, syllabus, 201, 'Syllabus created successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/academics/syllabus
  listSyllabus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        subjectId: req.query.subjectId as string,
        classId: req.query.classId as string,
        academicYear: req.query.academicYear as string
      };
      const syllabi = await this.academicsService.listSyllabus(filters);
      sendSuccess(res, syllabi, 200, 'Syllabus information retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/academics/syllabus/:id
  getSyllabusById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const syllabus = await this.academicsService.getSyllabusById(req.params.id);
      sendSuccess(res, syllabus, 200, 'Syllabus details retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/academics/allocations
  createAllocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const allocation = await this.academicsService.createAllocation(req.body);
      sendSuccess(res, allocation, 201, 'Teacher allocated to class and subject successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/academics/allocations
  listAllocations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        classId: req.query.classId as string,
        section: req.query.section as string,
        subjectId: req.query.subjectId as string,
        teacherId: req.query.teacherId as string,
        academicYear: req.query.academicYear as string,
        status: req.query.status as any
      };
      const allocations = await this.academicsService.listAllocations(filters);
      sendSuccess(res, allocations, 200, 'Allocations retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/academics/teachers
  listTeachers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teachers = await this.academicsService.listTeachers();
      sendSuccess(res, teachers, 200, 'Teachers reference list retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
