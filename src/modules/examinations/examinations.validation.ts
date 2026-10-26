import { z } from 'zod';

export const ExamSubjectSchema = z.object({
  subjectId: z.string().min(1, 'Subject ID is required'),
  subjectName: z.string().min(1, 'Subject name is required'),
  maxMarks: z.number().positive('Maximum marks must be positive').default(100),
  passMarks: z.number().min(0, 'Pass marks cannot be negative').default(40)
}).refine(data => data.passMarks <= data.maxMarks, {
  message: 'Pass marks cannot exceed maximum marks',
  path: ['passMarks']
});

export const CreateExamSchema = z.object({
  name: z.string().min(2, 'Exam name must be at least 2 characters'),
  academicYearId: z.string().min(1, 'Academic year is required'),
  examPeriodId: z.string().min(1, 'Exam period is required'),
  examTypeId: z.string().min(1, 'Exam type is required'),
  classId: z.string().min(1, 'Class is required'),
  className: z.string().optional(),
  sectionId: z.string().optional(),
  sectionName: z.string().optional(),
  subjects: z.array(ExamSubjectSchema).min(1, 'At least one subject is required'),
  maxMarks: z.number().positive().optional(),
  passingCriteria: z.object({
    minPassPercentage: z.number().min(0).max(100).default(40)
  }).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid startDate format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid endDate format (YYYY-MM-DD)'),
  schoolId: z.string().optional()
});

export const UpdateExamSchema = z.object({
  name: z.string().min(2).optional(),
  examPeriodId: z.string().optional(),
  examTypeId: z.string().optional(),
  subjects: z.array(ExamSubjectSchema).min(1).optional(),
  maxMarks: z.number().positive().optional(),
  passingCriteria: z.object({
    minPassPercentage: z.number().min(0).max(100)
  }).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()
});

export const UpdateExamStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], {
    required_error: 'Valid status is required'
  })
});

export const CreateScheduleSchema = z.object({
  subjectId: z.string().min(1, 'Subject ID is required'),
  subjectName: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/, 'Invalid date format (YYYY-MM-DD)'),
  startTime: z.string().datetime({ message: 'startTime must be a valid ISO 8601 string' }),
  endTime: z.string().datetime({ message: 'endTime must be a valid ISO 8601 string' }),
  roomId: z.string().min(1, 'Room ID is required'),
  roomName: z.string().optional(),
  studentCount: z.number().int().positive('Student count must be a positive integer'),
  invigilatorIds: z.array(z.string().min(1)).min(1, 'At least one invigilator must be assigned')
});

export const UpdateScheduleSchema = z.object({
  subjectId: z.string().min(1).optional(),
  subjectName: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional(),
  startTime: z.string().datetime({ message: 'startTime must be a valid ISO 8601 string' }).optional(),
  endTime: z.string().datetime({ message: 'endTime must be a valid ISO 8601 string' }).optional(),
  roomId: z.string().min(1).optional(),
  roomName: z.string().optional(),
  studentCount: z.number().int().positive().optional(),
  invigilatorIds: z.array(z.string().min(1)).min(1).optional()
});

export const UpdateScheduleStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED'], {
    required_error: 'Status is required (SCHEDULED, COMPLETED, CANCELLED)'
  })
});

export const ListExamsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  name: z.string().optional(),
  academicYearId: z.string().optional(),
  examTypeId: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export const ExamIdParamSchema = z.object({
  examId: z.string().min(1, 'Exam ID is required')
});

export const ScheduleIdParamSchema = z.object({
  examId: z.string().min(1, 'Exam ID is required'),
  scheduleId: z.string().min(1, 'Schedule ID is required')
});
