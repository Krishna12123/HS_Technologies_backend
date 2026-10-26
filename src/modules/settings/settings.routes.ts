import { Router } from 'express';
import { requireAuth, requireRole } from '../../common/middleware/auth.middleware';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { SettingsController } from './settings.controller';
import {
  BulkUpdateSettingsSchema,
  SettingKeyParamSchema,
  UpdateSchoolProfileSchema,
  UpdateSettingSchema
} from './settings.validation';

export function createSettingsRouter(controller: SettingsController): Router {
  const router = Router();

  // All settings routes require authentication
  router.use(requireAuth);

  // School profile routes (before :key to avoid route collision)
  router.get('/school-profile', controller.getSchoolProfile);
  router.patch(
    '/school-profile',
    requireRole('ADMIN', 'SUPER_ADMIN'),
    validateRequest({ body: UpdateSchoolProfileSchema }),
    controller.updateSchoolProfile
  );

  // Bulk update settings (before :key)
  router.patch(
    '/bulk',
    requireRole('ADMIN', 'SUPER_ADMIN'),
    validateRequest({ body: BulkUpdateSettingsSchema }),
    controller.bulkUpdate
  );

  // List all settings
  router.get('/', controller.getAll);

  // Get specific setting
  router.get(
    '/:key',
    validateRequest({ params: SettingKeyParamSchema }),
    controller.getByKey
  );

  // Update specific setting
  router.patch(
    '/:key',
    requireRole('ADMIN', 'SUPER_ADMIN'),
    validateRequest({ params: SettingKeyParamSchema, body: UpdateSettingSchema }),
    controller.updateByKey
  );

  return router;
}
