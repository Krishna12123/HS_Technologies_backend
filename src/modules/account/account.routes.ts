import { Router } from 'express';
import { requireAuth } from '../../common/middleware/auth.middleware';
import { validateRequest } from '../../common/middleware/validation.middleware';
import { AccountController } from './account.controller';
import {
  ChangePasswordSchema,
  UpdatePreferencesSchema,
  UpdateProfileSchema
} from './account.validation';

export function createAccountRouter(controller: AccountController): Router {
  const router = Router();

  // All account routes require authenticated user
  router.use(requireAuth);

  // Preferences routes
  router.get('/me/preferences', controller.getPreferences);
  router.patch(
    '/me/preferences',
    validateRequest({ body: UpdatePreferencesSchema }),
    controller.updatePreferences
  );

  // Password change
  router.post(
    '/me/change-password',
    validateRequest({ body: ChangePasswordSchema }),
    controller.changePassword
  );

  // Profile me routes
  router.get('/me', controller.getProfile);
  router.patch(
    '/me',
    validateRequest({ body: UpdateProfileSchema }),
    controller.updateProfile
  );

  return router;
}
