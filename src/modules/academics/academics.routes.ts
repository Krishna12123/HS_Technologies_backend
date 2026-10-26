import { Router } from 'express';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { AcademicsController } from './academics.controller';
import {
  CreateAllocationSchema,
  CreateSubjectSchema,
  CreateSyllabusSchema,
  ListAllocationsQuerySchema,
  ListSubjectsQuerySchema,
  ListSyllabusQuerySchema
} from './academics.validators';

export function createAcademicsRouter(controller: AcademicsController): Router {
  const router = Router();

  // Subjects Catalog
  router.post(
    '/subjects',
    validateRequest({ body: CreateSubjectSchema }),
    controller.createSubject
  );

  router.get(
    '/subjects',
    validateRequest({ query: ListSubjectsQuerySchema }),
    controller.listSubjects
  );

  router.get(
    '/subjects/:id',
    controller.getSubjectById
  );

  // Syllabus Management
  router.post(
    '/syllabus',
    validateRequest({ body: CreateSyllabusSchema }),
    controller.createSyllabus
  );

  router.get(
    '/syllabus',
    validateRequest({ query: ListSyllabusQuerySchema }),
    controller.listSyllabus
  );

  router.get(
    '/syllabus/:id',
    controller.getSyllabusById
  );

  // Class-Subject-Teacher Allocation
  router.post(
    '/allocations',
    validateRequest({ body: CreateAllocationSchema }),
    controller.createAllocation
  );

  router.get(
    '/allocations',
    validateRequest({ query: ListAllocationsQuerySchema }),
    controller.listAllocations
  );

  // Teacher References
  router.get(
    '/teachers',
    controller.listTeachers
  );

  return router;
}
