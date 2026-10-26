import request from 'supertest';
import { createApp } from '../src/app';

describe('Day 1 - Academics Module Tests', () => {
  let app: any;

  beforeEach(() => {
    const instance = createApp();
    app = instance.app;
  });

  describe('Subject Catalog', () => {
    it('should create a valid subject with Core type', async () => {
      const res = await request(app)
        .post('/api/v1/academics/subjects')
        .send({
          name: 'English Literature',
          code: 'ENG201',
          type: 'Core',
          description: 'High school English Literature',
          maxMarks: 100,
          minPassMarks: 35
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('English Literature');
      expect(res.body.data.code).toBe('ENG201');
      expect(res.body.data.type).toBe('Core');
      expect(res.body.data.maxMarks).toBe(100);
      expect(res.body.data.minPassMarks).toBe(35);
      expect(res.body.data.status).toBe('ACTIVE');
    });

    it('should reject subject creation with invalid subject type', async () => {
      const res = await request(app)
        .post('/api/v1/academics/subjects')
        .send({
          name: 'Invalid Type Subject',
          code: 'INV101',
          type: 'Vocational', // Not one of Core, Elective, Practical
          maxMarks: 100,
          minPassMarks: 40
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject subject creation when minimum marks exceed maximum marks', async () => {
      const res = await request(app)
        .post('/api/v1/academics/subjects')
        .send({
          name: 'Advanced Chemistry',
          code: 'CHEM301',
          type: 'Elective',
          maxMarks: 50,
          minPassMarks: 60 // 60 > 50 -> Invalid!
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject subject creation with negative minimum passing marks', async () => {
      const res = await request(app)
        .post('/api/v1/academics/subjects')
        .send({
          name: 'Negative Pass Marks',
          code: 'NEG101',
          type: 'Practical',
          maxMarks: 50,
          minPassMarks: -5
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should retrieve list of subjects with filters', async () => {
      const res = await request(app)
        .get('/api/v1/academics/subjects?type=Core')
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.every((s: any) => s.type === 'Core')).toBe(true);
    });
  });

  describe('Syllabus Management', () => {
    it('should create syllabus with ordered milestones for a valid subject', async () => {
      const res = await request(app)
        .post('/api/v1/academics/syllabus')
        .send({
          subjectId: 'SUBJ-001',
          classId: 'CLASS-10',
          academicYear: '2026-2027',
          title: 'Class 10 Mathematics Annual Syllabus',
          description: 'Complete yearly plan',
          milestones: [
            { sequenceNumber: 1, title: 'Real Numbers & Polynomials', description: 'Unit 1' },
            { sequenceNumber: 2, title: 'Linear Equations & Quadratic', description: 'Unit 2' },
            { sequenceNumber: 3, title: 'Coordinate Geometry & Triangles', description: 'Unit 3' }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.milestones).toHaveLength(3);
      expect(res.body.data.milestones[0].sequenceNumber).toBe(1);
      expect(res.body.data.milestones[1].sequenceNumber).toBe(2);
      expect(res.body.data.milestones[2].sequenceNumber).toBe(3);
    });

    it('should reject syllabus creation with duplicate milestone sequence numbers', async () => {
      const res = await request(app)
        .post('/api/v1/academics/syllabus')
        .send({
          subjectId: 'SUBJ-001',
          classId: 'CLASS-10',
          academicYear: '2026-2027',
          title: 'Syllabus with Duplicates',
          milestones: [
            { sequenceNumber: 1, title: 'Milestone Alpha' },
            { sequenceNumber: 1, title: 'Milestone Beta (Duplicate)' } // Duplicate sequence 1!
          ]
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject syllabus creation for non-existent subject', async () => {
      const res = await request(app)
        .post('/api/v1/academics/syllabus')
        .send({
          subjectId: 'NON-EXISTENT-SUBJ',
          classId: 'CLASS-10',
          academicYear: '2026-2027',
          title: 'Orphan Syllabus',
          milestones: [{ sequenceNumber: 1, title: 'Unit 1' }]
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('SUBJECT_NOT_FOUND');
    });

    it('should retrieve syllabus and return milestones in sorted sequence', async () => {
      const res = await request(app)
        .get('/api/v1/academics/syllabus?subjectId=SUBJ-001')
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Class-Subject-Teacher Allocation', () => {
    it('should allocate teacher to class, section, and subject', async () => {
      const res = await request(app)
        .post('/api/v1/academics/allocations')
        .send({
          classId: 'CLASS-10',
          section: 'SEC-A',
          subjectId: 'SUBJ-001',
          teacherId: 'T-101',
          academicYear: '2026-2027'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.teacherId).toBe('T-101');
      expect(res.body.data.subjectId).toBe('SUBJ-001');
      expect(res.body.data.status).toBe('ACTIVE');
    });

    it('should reject duplicate active allocation for same class, section, subject, and year', async () => {
      // 1. Create first allocation
      await request(app)
        .post('/api/v1/academics/allocations')
        .send({
          classId: 'CLASS-9',
          section: 'SEC-B',
          subjectId: 'SUBJ-001',
          teacherId: 'T-101',
          academicYear: '2026-2027'
        });

      // 2. Attempt duplicate allocation for the same slot with another teacher
      const duplicateRes = await request(app)
        .post('/api/v1/academics/allocations')
        .send({
          classId: 'CLASS-9',
          section: 'SEC-B',
          subjectId: 'SUBJ-001',
          teacherId: 'T-102',
          academicYear: '2026-2027'
        });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.error.code).toBe('DUPLICATE_ALLOCATION');
    });

    it('should reject allocation when referenced teacher does not exist', async () => {
      const res = await request(app)
        .post('/api/v1/academics/allocations')
        .send({
          classId: 'CLASS-10',
          section: 'SEC-A',
          subjectId: 'SUBJ-001',
          teacherId: 'NON-EXISTENT-TEACHER',
          academicYear: '2026-2027'
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TEACHER_NOT_FOUND');
    });

    it('should reject allocation when referenced subject does not exist', async () => {
      const res = await request(app)
        .post('/api/v1/academics/allocations')
        .send({
          classId: 'CLASS-10',
          section: 'SEC-A',
          subjectId: 'NON-EXISTENT-SUBJ',
          teacherId: 'T-101',
          academicYear: '2026-2027'
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('SUBJECT_NOT_FOUND');
    });
  });
});
