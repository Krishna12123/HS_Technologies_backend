import request from 'supertest';
import { createApp } from '../src/app';
import { GradingEngineService } from '../src/modules/results-grading/grading.service';
import { MarksValidationService } from '../src/modules/results-grading/marks-validation.service';

describe('Day 2 - Marks Entry & Grading Engine Tests', () => {
  let app: any;
  const examId = 'EXAM-001'; // Seeded exam with SUBJ-001 (maxMarks: 100) and SUBJ-002 (maxMarks: 50)
  const studentId = 'S-101';

  beforeEach(() => {
    const instance = createApp();
    app = instance.app;
  });

  describe('Marks Entry Endpoints', () => {
    it('should submit valid marks for an enrolled student and valid exam subject', async () => {
      const res = await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({
          studentId: 'S-101',
          subjectId: 'SUBJ-001',
          marksObtained: 85
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.marksObtained).toBe(85);
      expect(res.body.data.studentId).toBe('S-101');
      expect(res.body.data.status).toBe('SUBMITTED');
    });

    it('should reject negative marks submission', async () => {
      const res = await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({
          studentId: 'S-101',
          subjectId: 'SUBJ-001',
          marksObtained: -10
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('RESULT_INVALID_MARKS');
    });

    it('should reject marks exceeding permitted maximum marks', async () => {
      // SUBJ-001 maxMarks is 100. Submitting 105!
      const res = await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({
          studentId: 'S-101',
          subjectId: 'SUBJ-001',
          marksObtained: 105
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('RESULT_INVALID_MARKS');
    });

    it('should reject duplicate marks submission for the same student, exam, and subject', async () => {
      // 1. Submit initial marks
      await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({
          studentId: 'S-102',
          subjectId: 'SUBJ-001',
          marksObtained: 75
        });

      // 2. Submit duplicate marks
      const duplicateRes = await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({
          studentId: 'S-102',
          subjectId: 'SUBJ-001',
          marksObtained: 80
        });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.error.code).toBe('RESULT_DUPLICATE');
    });

    it('should reject marks for a non-existent student', async () => {
      const res = await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({
          studentId: 'NON-EXISTENT-STUDENT',
          subjectId: 'SUBJ-001',
          marksObtained: 70
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should reject marks for a subject not registered under the examination', async () => {
      const res = await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({
          studentId: 'S-101',
          subjectId: 'UNREGISTERED-SUBJECT',
          marksObtained: 70
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should retrieve entered marks with student and subject filter', async () => {
      await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({
          studentId: 'S-103',
          subjectId: 'SUBJ-001',
          marksObtained: 92
        });

      const res = await request(app)
        .get(`/api/v1/exams/${examId}/marks?studentId=S-103&subjectId=SUBJ-001`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].marksObtained).toBe(92);
    });
  });

  describe('Marks Validation Unit Service', () => {
    const validator = new MarksValidationService();

    it('should validate normal marks within range without clamping', () => {
      const result = validator.validateMarks(45, 50);
      expect(result.marksObtained).toBe(45);
      expect(result.maxMarks).toBe(50);
    });

    it('should throw for negative obtained marks', () => {
      expect(() => validator.validateMarks(-1, 100)).toThrow();
    });

    it('should throw for obtained marks exceeding maxMarks', () => {
      expect(() => validator.validateMarks(101, 100)).toThrow();
    });

    it('should throw for non-positive maxMarks', () => {
      expect(() => validator.validateMarks(10, 0)).toThrow();
      expect(() => validator.validateMarks(10, -50)).toThrow();
    });

    it('should throw for non-numeric marks values', () => {
      expect(() => validator.validateMarks('eighty' as any, 100)).toThrow();
      expect(() => validator.validateMarks(NaN, 100)).toThrow();
    });
  });

  describe('Grading Engine & Boundaries Unit Service', () => {
    const engine = new GradingEngineService();

    it('should handle exact score of 0 correctly', () => {
      const pct = engine.calculatePercentage(0, 100);
      expect(pct).toBe(0);
      const grade = engine.assignGrade(pct);
      expect(grade.isPassing).toBe(false);
      expect(grade.grade).toBe('E');
    });

    it('should handle exact score of 100 correctly', () => {
      const pct = engine.calculatePercentage(100, 100);
      expect(pct).toBe(100);
      const grade = engine.assignGrade(pct);
      expect(grade.isPassing).toBe(true);
      expect(grade.grade).toBe('A1');
    });

    it('should evaluate boundary values accurately (91 gives A1, 90.99 gives A2, 81 gives A2)', () => {
      expect(engine.assignGrade(91).grade).toBe('A1');
      expect(engine.assignGrade(90.99).grade).toBe('A2');
      expect(engine.assignGrade(81).grade).toBe('A2');
      expect(engine.assignGrade(80.99).grade).toBe('B1');
    });

    it('should apply standard half-up percentage rounding to 2 decimal places', () => {
      // 89.996% should round to 90%
      const pct = engine.calculatePercentage(89.996, 100);
      expect(pct).toBe(90);

      // 40 / 70 = 57.142857...% -> 57.14%
      const pct2 = engine.calculatePercentage(40, 70);
      expect(pct2).toBe(57.14);
    });

    it('should protect against zero denominator safely', () => {
      const pct = engine.calculatePercentage(50, 0);
      expect(pct).toBe(0);
    });

    it('should reject invalid and overlapping grade configurations', () => {
      // Overlapping configuration: Grade X overlaps Grade Y
      const overlappingRanges = [
        { grade: 'X', minPercentage: 80, maxPercentage: 100, isPassing: true },
        { grade: 'Y', minPercentage: 70, maxPercentage: 85, isPassing: true } // Overlap in [80, 85]
      ];

      expect(() => engine.setBoundaries(overlappingRanges as any)).toThrow();
    });
  });
});
