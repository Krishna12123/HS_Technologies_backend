import { Router } from 'express';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { ResultsController } from './results.controller';
import {
  ConfigureGracePolicySchema,
  ExamIdParamSchema,
  ListMarksQuerySchema,
  ResultIdParamSchema,
  StudentReportCardParamSchema,
  SubmitMarksSchema,
  UpdateMarksSchema
} from './results.validators';

export function createResultsRouter(controller: ResultsController): Router {
  const router = Router();

  // POST /api/v1/results/:id/publish
  router.post(
    '/:id/publish',
    validateRequest({ params: ResultIdParamSchema }),
    controller.publishResult
  );

  // PATCH /api/v1/results/marks/:marksId (Authorized correction)
  router.patch(
    '/marks/:marksId',
    validateRequest({ body: UpdateMarksSchema }),
    controller.correctMarks
  );

  return router;
}

export function createExamMarksRouter(controller: ResultsController): Router {
  const router = Router();

  // POST /api/v1/exams/:id/marks
  router.post(
    '/:id/marks',
    validateRequest({ params: ExamIdParamSchema, body: SubmitMarksSchema }),
    controller.submitMarks
  );

  // GET /api/v1/exams/:id/marks
  router.get(
    '/:id/marks',
    validateRequest({ params: ExamIdParamSchema, query: ListMarksQuerySchema }),
    controller.getMarks
  );

  // POST /api/v1/exams/:id/grace-policy
  router.post(
    '/:id/grace-policy',
    validateRequest({ params: ExamIdParamSchema, body: ConfigureGracePolicySchema }),
    controller.configureGracePolicy
  );

  // GET /api/v1/exams/:id/results/student/:studentId
  router.get(
    '/:id/results/student/:studentId',
    validateRequest({ params: StudentReportCardParamSchema }),
    controller.getStudentReportCard
  );

  return router;
}
