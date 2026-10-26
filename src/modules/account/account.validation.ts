import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  contactNumber: z.string().min(5, 'Contact number must be at least 5 digits').max(20).optional(),
  profileImageUrl: z.string().url('Invalid profile image URL').optional().or(z.literal(''))
}).strict(); // Disallow extra fields like role or schoolId to prevent privilege escalation

export const UpdatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notificationsEnabled: z.boolean().optional(),
  emailDigest: z.boolean().optional(),
  language: z.string().min(2).max(10).optional()
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'New password cannot be the same as the current password',
  path: ['newPassword']
});
