import { Router } from 'express';
import { requireAuth, requireRole } from '../../common/middleware/auth.middleware';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { ResultsController } from './results.controller';
import {
  BulkCreateResultSchema,
  CreateResultSchema,
  ExamParamSchema,
  ListResultsQuerySchema,
  ReportCardQuerySchema,
  ResultIdParamSchema,
  StudentParamSchema,
  UpdateResultSchema
} from './results.validation';

export function createResultsRouter(controller: ResultsController): Router {
  const router = Router();

  // Authentication required for all results endpoints
  router.use(requireAuth);

  // Bulk creation (must precede :resultId)
  router.post(
    '/bulk',
    requireRole('ADMIN', 'EXAM_OFFICER', 'TEACHER', 'SUPER_ADMIN'),
    validateRequest({ body: BulkCreateResultSchema }),
    controller.bulkCreate
  );

  // Student report card (must precede student/:studentId)
  router.get(
    '/student/:studentId/report-card',
    validateRequest({ params: StudentParamSchema, query: ReportCardQuerySchema }),
    controller.getReportCard
  );

  // Student specific results
  router.get(
    '/student/:studentId',
    validateRequest({ params: StudentParamSchema }),
    controller.getByStudent
  );

  // Exam specific results
  router.get(
    '/exam/:examId',
    validateRequest({ params: ExamParamSchema }),
    controller.getByExam
  );

  // General list & create
  router.get(
    '/',
    validateRequest({ query: ListResultsQuerySchema }),
    controller.list
  );

  router.post(
    '/',
    requireRole('ADMIN', 'EXAM_OFFICER', 'TEACHER', 'SUPER_ADMIN'),
    validateRequest({ body: CreateResultSchema }),
    controller.create
  );

  // Single result by ID
  router.get(
    '/:resultId',
    validateRequest({ params: ResultIdParamSchema }),
    controller.getById
  );

  // Update result (editable or authorized correction)
  router.patch(
    '/:resultId',
    requireRole('ADMIN', 'EXAM_OFFICER', 'TEACHER', 'SUPER_ADMIN'),
    validateRequest({ params: ResultIdParamSchema, body: UpdateResultSchema }),
    controller.update
  );

  // Publish result (ADMIN or EXAM_OFFICER)
  router.post(
    '/:resultId/publish',
    requireRole('ADMIN', 'EXAM_OFFICER', 'SUPER_ADMIN'),
    validateRequest({ params: ResultIdParamSchema }),
    controller.publish
  );

  return router;
}
