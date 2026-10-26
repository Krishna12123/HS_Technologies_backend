import { z } from 'zod';

export const SubmitMarksSchema = z.object({
  studentId: z.string({ required_error: 'Student ID is required' }).trim().min(1),
  subjectId: z.string({ required_error: 'Subject ID is required' }).trim().min(1),
  marksObtained: z.number({ required_error: 'Marks obtained is required' }),
  maxMarks: z.number().positive().optional(),
  enteredBy: z.string().optional()
});

export const UpdateMarksSchema = z.object({
  marksObtained: z.number({ required_error: 'Marks obtained is required' }),
  reason: z.string({ required_error: 'Correction reason is mandatory' }).trim().min(1)
});

export const ListMarksQuerySchema = z.object({
  studentId: z.string().optional(),
  subjectId: z.string().optional()
});

export const ConfigureGracePolicySchema = z.object({
  enabled: z.boolean(),
  maxGraceMarksPerSubject: z.number().min(0),
  maxTotalGraceMarks: z.number().min(0),
  applicableOnlyIfPassingPossible: z.boolean().optional().default(true)
});

export const ExamIdParamSchema = z.object({
  id: z.string().min(1)
});

export const ResultIdParamSchema = z.object({
  id: z.string().min(1)
});

export const StudentReportCardParamSchema = z.object({
  id: z.string().min(1),
  studentId: z.string().min(1)
});
