import { z } from 'zod';
import { ALLOWED_MASTER_CATEGORIES } from './masters.types';

export const CategoryParamSchema = z.object({
  category: z.enum(ALLOWED_MASTER_CATEGORIES, {
    errorMap: () => ({
      message: `Invalid master category. Allowed categories are: ${ALLOWED_MASTER_CATEGORIES.join(', ')}`
    })
  })
});

export const MasterIdParamSchema = z.object({
  category: z.enum(ALLOWED_MASTER_CATEGORIES),
  id: z.string().min(1, 'Master record ID is required')
});

export const GradeRangeItemSchema = z.object({
  grade: z.string().min(1, 'Grade symbol is required (e.g. A, B+)'),
  minPercentage: z.number().min(0, 'minPercentage must be at least 0').max(100, 'minPercentage cannot exceed 100'),
  maxPercentage: z.number().min(0, 'maxPercentage must be at least 0').max(100, 'maxPercentage cannot exceed 100'),
  gradePoint: z.number().optional(),
  isPassing: z.boolean(),
  remarks: z.string().optional()
}).refine(data => data.maxPercentage >= data.minPercentage, {
  message: 'maxPercentage must be greater than or equal to minPercentage',
  path: ['maxPercentage']
});

export const CreateMasterSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50, 'Code too long'),
  name: z.string().min(1, 'Name is required').max(150, 'Name too long'),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  schoolId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  // Specific category fields
  capacity: z.number().int().positive('Capacity must be a positive integer').optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid date format (YYYY-MM-DD)').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid date format (YYYY-MM-DD)').optional(),
  ranges: z.array(GradeRangeItemSchema).optional()
});

export const UpdateMasterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150).optional(),
  metadata: z.record(z.any()).optional(),
  capacity: z.number().int().positive('Capacity must be a positive integer').optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional(),
  ranges: z.array(GradeRangeItemSchema).optional()
});

export const UpdateMasterStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    required_error: 'Status is required (ACTIVE or INACTIVE)'
  })
});

export const ListMasterQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  search: z.string().optional()
});
