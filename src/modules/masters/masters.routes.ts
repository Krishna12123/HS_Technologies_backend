import { Router } from 'express';
import { requireAuth, requireRole } from '../../common/middleware/auth.middleware';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { MastersController } from './masters.controller';
import {
  CategoryParamSchema,
  CreateMasterSchema,
  ListMasterQuerySchema,
  MasterIdParamSchema,
  UpdateMasterSchema,
  UpdateMasterStatusSchema
} from './masters.validation';

export function createMastersRouter(controller: MastersController): Router {
  const router = Router();

  // All masters routes require authentication
  router.use(requireAuth);

  // List master records in category
  router.get(
    '/:category',
    validateRequest({ params: CategoryParamSchema, query: ListMasterQuerySchema }),
    controller.list
  );

  // Create master record in category (ADMIN or EXAM_OFFICER)
  router.post(
    '/:category',
    requireRole('ADMIN', 'EXAM_OFFICER', 'SUPER_ADMIN'),
    validateRequest({ params: CategoryParamSchema, body: CreateMasterSchema }),
    controller.create
  );

  // Retrieve single master record
  router.get(
    '/:category/:id',
    validateRequest({ params: MasterIdParamSchema }),
    controller.getById
  );

  // Update master record (ADMIN or EXAM_OFFICER)
  router.patch(
    '/:category/:id',
    requireRole('ADMIN', 'EXAM_OFFICER', 'SUPER_ADMIN'),
    validateRequest({ params: MasterIdParamSchema, body: UpdateMasterSchema }),
    controller.update
  );

  // Activate / deactivate status (ADMIN or EXAM_OFFICER)
  router.patch(
    '/:category/:id/status',
    requireRole('ADMIN', 'EXAM_OFFICER', 'SUPER_ADMIN'),
    validateRequest({ params: MasterIdParamSchema, body: UpdateMasterStatusSchema }),
    controller.updateStatus
  );

  return router;
}
