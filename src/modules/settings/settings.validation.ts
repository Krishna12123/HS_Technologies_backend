import { z } from 'zod';
import { ALLOWED_SETTING_KEYS } from './settings.types';

export const SettingKeyParamSchema = z.object({
  key: z.enum(ALLOWED_SETTING_KEYS, {
    errorMap: () => ({
      message: `Invalid setting key. Allowed keys: ${ALLOWED_SETTING_KEYS.join(', ')}`
    })
  })
});

export const UpdateSettingSchema = z.object({
  value: z.any({
    required_error: 'Setting value is required'
  })
});

export const BulkUpdateSettingsSchema = z.object({
  settings: z.array(
    z.object({
      key: z.enum(ALLOWED_SETTING_KEYS, {
        errorMap: () => ({
          message: `Unsupported setting key. Key must be one of: ${ALLOWED_SETTING_KEYS.join(', ')}`
        })
      }),
      value: z.any({
        required_error: 'Value is required for each setting'
      })
    })
  ).min(1, 'At least one setting must be provided for bulk update')
});

export const UpdateSchoolProfileSchema = z.object({
  schoolName: z.string().min(2, 'School name must be at least 2 characters').optional(),
  schoolCode: z.string().min(2, 'School code must be at least 2 characters').optional(),
  address: z.string().min(5, 'Address must be at least 5 characters').optional(),
  contactNumber: z.string().min(5, 'Contact number is required').optional(),
  officialEmail: z.string().email('Invalid official email address').optional(),
  logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  principalName: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal(''))
});
