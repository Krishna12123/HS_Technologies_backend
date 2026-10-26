import { z } from 'zod';

export const SubjectTypeEnum = z.enum(['Core', 'Elective', 'Practical']);
export const AcademicStatusEnum = z.enum(['ACTIVE', 'INACTIVE']);
export const MilestoneStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);

export const CreateSubjectSchema = z
  .object({
    name: z.string({ required_error: 'Subject name is required' }).trim().min(1, 'Subject name cannot be empty'),
    code: z.string({ required_error: 'Subject code is required' }).trim().min(1, 'Subject code cannot be empty'),
    type: SubjectTypeEnum,
    description: z.string().optional().default(''),
    maxMarks: z
      .number({ required_error: 'Maximum marks must be a number' })
      .positive('Maximum marks must be positive (greater than 0)'),
    minPassMarks: z
      .number({ required_error: 'Minimum passing marks must be a number' })
      .min(0, 'Minimum passing marks cannot be negative'),
    status: AcademicStatusEnum.optional().default('ACTIVE')
  })
  .refine((data) => data.minPassMarks <= data.maxMarks, {
    message: 'Minimum passing marks cannot exceed maximum marks',
    path: ['minPassMarks']
  });

export const ListSubjectsQuerySchema = z.object({
  type: SubjectTypeEnum.optional(),
  status: AcademicStatusEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20)
});

export const CreateMilestoneSchema = z.object({
  title: z.string({ required_error: 'Milestone title is required' }).trim().min(1, 'Milestone title cannot be empty'),
  description: z.string().optional().default(''),
  sequenceNumber: z
    .number({ required_error: 'Sequence number is required' })
    .int('Sequence number must be an integer')
    .positive('Sequence number must be a positive integer (>= 1)'),
  status: MilestoneStatusEnum.optional().default('PENDING')
});

export const CreateSyllabusSchema = z
  .object({
    subjectId: z.string({ required_error: 'Subject ID is required' }).trim().min(1, 'Subject ID cannot be empty'),
    classId: z.string({ required_error: 'Class or grade is required' }).trim().min(1, 'Class cannot be empty'),
    academicYear: z.string({ required_error: 'Academic year is required' }).trim().min(1, 'Academic year cannot be empty'),
    title: z.string({ required_error: 'Syllabus title is required' }).trim().min(1, 'Title cannot be empty'),
    description: z.string().optional().default(''),
    milestones: z.array(CreateMilestoneSchema).min(1, 'At least one syllabus milestone is required')
  })
  .refine(
    (data) => {
      const sequences = data.milestones.map((m) => m.sequenceNumber);
      const uniqueSequences = new Set(sequences);
      return uniqueSequences.size === sequences.length;
    },
    {
      message: 'Duplicate sequence numbers found in syllabus milestones',
      path: ['milestones']
    }
  );

export const ListSyllabusQuerySchema = z.object({
  subjectId: z.string().optional(),
  classId: z.string().optional(),
  academicYear: z.string().optional()
});

export const CreateAllocationSchema = z.object({
  classId: z.string({ required_error: 'Class or grade is required' }).trim().min(1, 'Class cannot be empty'),
  section: z.string({ required_error: 'Section is required' }).trim().min(1, 'Section cannot be empty'),
  subjectId: z.string({ required_error: 'Subject ID is required' }).trim().min(1, 'Subject ID cannot be empty'),
  teacherId: z.string({ required_error: 'Teacher ID is required' }).trim().min(1, 'Teacher ID cannot be empty'),
  academicYear: z.string({ required_error: 'Academic year is required' }).trim().min(1, 'Academic year cannot be empty'),
  status: AcademicStatusEnum.optional().default('ACTIVE')
});

export const ListAllocationsQuerySchema = z.object({
  classId: z.string().optional(),
  section: z.string().optional(),
  subjectId: z.string().optional(),
  teacherId: z.string().optional(),
  academicYear: z.string().optional(),
  status: AcademicStatusEnum.optional()
});
