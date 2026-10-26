import { z } from 'zod';

export const CreateResultSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  studentName: z.string().optional(),
  examId: z.string().min(1, 'Exam ID is required'),
  subjectId: z.string().min(1, 'Subject ID is required'),
  subjectName: z.string().optional(),
  maxMarks: z.number().positive('Maximum marks must be positive'),
  marksObtained: z.number().min(0, 'Marks obtained cannot be negative'),
  remarks: z.string().optional(),
  schoolId: z.string().optional()
}).refine(data => data.marksObtained <= data.maxMarks, {
  message: 'Marks obtained cannot exceed maximum marks',
  path: ['marksObtained']
});

export const UpdateResultSchema = z.object({
  marksObtained: z.number().min(0, 'Marks obtained cannot be negative').optional(),
  remarks: z.string().optional(),
  reason: z.string().min(5, 'Correction reason must be at least 5 characters').optional()
});

export const BulkCreateResultSchema = z.object({
  examId: z.string().min(1, 'Exam ID is required'),
  results: z.array(
    z.object({
      studentId: z.string().min(1, 'Student ID is required'),
      studentName: z.string().optional(),
      subjectId: z.string().min(1, 'Subject ID is required'),
      subjectName: z.string().optional(),
      maxMarks: z.number().positive('Maximum marks must be positive'),
      marksObtained: z.number().min(0, 'Marks obtained cannot be negative'),
      remarks: z.string().optional()
    }).refine(data => data.marksObtained <= data.maxMarks, {
      message: 'Marks obtained cannot exceed maximum marks',
      path: ['marksObtained']
    })
  ).min(1, 'At least one result item is required')
});

export const ListResultsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  examId: z.string().optional(),
  studentId: z.string().optional(),
  subjectId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CORRECTED']).optional()
});

export const ResultIdParamSchema = z.object({
  resultId: z.string().min(1, 'Result ID is required')
});

export const StudentParamSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required')
});

export const ExamParamSchema = z.object({
  examId: z.string().min(1, 'Exam ID is required')
});

export const ReportCardQuerySchema = z.object({
  examId: z.string().min(1, 'Query parameter examId is required for report-card calculation')
});
