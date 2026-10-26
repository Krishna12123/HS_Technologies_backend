import { z } from 'zod';

export const ExamPeriodEnum = z.enum(['Term 1', 'Midterm', 'Final']);
export const ExamStatusEnum = z.enum([
  'DRAFT',
  'SCHEDULED',
  'PUBLISHED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
]);

export const ExamSubjectSchema = z.object({
  subjectId: z.string({ required_error: 'Subject ID is required' }).trim().min(1),
  subjectName: z.string().optional(),
  maxMarks: z.number().positive('Subject maxMarks must be positive'),
  passMarks: z.number().min(0, 'Subject passMarks cannot be negative')
}).refine((s) => s.passMarks <= s.maxMarks, {
  message: 'Subject passMarks cannot exceed maxMarks',
  path: ['passMarks']
});

export const CreateExamSchema = z
  .object({
    name: z.string({ required_error: 'Exam name is required' }).trim().min(1),
    academicYear: z.string({ required_error: 'Academic year is required' }).trim().min(1),
    examPeriod: z.union([ExamPeriodEnum, z.string().min(1)]),
    examType: z.string({ required_error: 'Exam type is required' }).trim().min(1),
    classId: z.string({ required_error: 'Class ID is required' }).trim().min(1),
    className: z.string().optional(),
    sectionId: z.string().optional(),
    sectionName: z.string().optional(),
    subjects: z.array(ExamSubjectSchema).min(1, 'Exam must contain at least one subject'),
    startDate: z.string({ required_error: 'Start date is required' }),
    endDate: z.string({ required_error: 'End date is required' }),
    gradingCriteriaId: z.string().optional(),
    schoolId: z.string().optional()
  })
  .refine(
    (data) => new Date(data.endDate).getTime() >= new Date(data.startDate).getTime(),
    {
      message: 'Exam endDate must be on or after startDate',
      path: ['endDate']
    }
  );

export const UpdateExamSchema = z.object({
  name: z.string().min(1).optional(),
  academicYear: z.string().min(1).optional(),
  examPeriod: z.union([ExamPeriodEnum, z.string().min(1)]).optional(),
  examType: z.string().min(1).optional(),
  subjects: z.array(ExamSubjectSchema).min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gradingCriteriaId: z.string().optional()
});

export const ListExamsQuerySchema = z.object({
  name: z.string().optional(),
  academicYear: z.string().optional(),
  academicYearId: z.string().optional(),
  examPeriod: z.string().optional(),
  examPeriodId: z.string().optional(),
  examType: z.string().optional(),
  examTypeId: z.string().optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  status: ExamStatusEnum.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20)
});

export const CreateScheduleSchema = z.object({
  subjectId: z.string({ required_error: 'Subject ID is required' }).trim().min(1),
  subjectName: z.string().optional(),
  date: z.string({ required_error: 'Date is required' }),
  startTime: z.string({ required_error: 'Start time is required' }),
  endTime: z.string({ required_error: 'End time is required' }),
  roomId: z.string({ required_error: 'Room ID is required' }).trim().min(1),
  roomName: z.string().optional(),
  studentCount: z.number({ required_error: 'Student count is required' }).int().positive(),
  invigilatorIds: z.array(z.string().min(1)).min(1, 'At least one invigilator must be assigned')
});

export const GradeBoundarySchema = z.object({
  grade: z.string({ required_error: 'Grade symbol is required' }).trim().min(1),
  minPercentage: z.number().min(0).max(100),
  maxPercentage: z.number().min(0).max(100),
  isPassing: z.boolean(),
  gradePoint: z.number().optional(),
  remarks: z.string().optional()
});

export const CreateGradingCriteriaSchema = z.object({
  name: z.string({ required_error: 'Scheme name is required' }).trim().min(1),
  examId: z.string().optional(),
  minScale: z.number().optional().default(0),
  maxScale: z.number().optional().default(100),
  boundaries: z.array(GradeBoundarySchema).min(1, 'At least one boundary must be provided')
});

export const ExamIdParamSchema = z.object({
  examId: z.string().min(1)
});

export const ExamIdParamIdSchema = z.object({
  id: z.string().min(1)
});
