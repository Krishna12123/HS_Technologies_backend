import { Router } from 'express';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { ExaminationsController } from './examinations.controller';
import {
  CreateExamSchema,
  CreateGradingCriteriaSchema,
  CreateScheduleSchema,
  ListExamsQuerySchema
} from './examinations.validators';

export function createExaminationsRouter(controller: ExaminationsController): Router {
  const router = Router();

  // Rooms and Criteria routes (placed before :id to prevent param collision)
  router.get('/rooms', controller.listRooms);

  router.post(
    '/grading-criteria',
    validateRequest({ body: CreateGradingCriteriaSchema }),
    controller.createGradingCriteria
  );

  router.get('/grading-criteria', controller.listGradingCriteria);

  // Exam CRUD
  router.post(
    '/',
    validateRequest({ body: CreateExamSchema }),
    controller.createExam
  );

  router.get(
    '/',
    validateRequest({ query: ListExamsQuerySchema }),
    controller.listExams
  );

  router.get('/:id', controller.getExamById);

  // Scheduling routes
  router.post(
    '/:id/schedules',
    validateRequest({ body: CreateScheduleSchema }),
    controller.createSchedule
  );

  router.get('/:id/schedules', controller.listSchedules);

  return router;
}
