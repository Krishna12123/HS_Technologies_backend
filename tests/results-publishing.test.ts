import request from 'supertest';
import { createApp } from '../src/app';

describe('Day 2 - Results Computation, Publishing & Report Card Tests', () => {
  let app: any;
  const examId = 'EXAM-001'; // Exam has 2 subjects: SUBJ-001 (pass: 40, max: 100), SUBJ-002 (pass: 20, max: 50)
  const studentId = 'S-101';

  beforeEach(() => {
    const instance = createApp();
    app = instance.app;
  });

  describe('Pass/Fail Evaluation & Grace Marks', () => {
    it('should evaluate subject pass/fail and overall pass when all subjects meet passing marks', async () => {
      // SUBJ-001: 75/100 (pass: 40)
      await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({ studentId, subjectId: 'SUBJ-001', marksObtained: 75 });

      // SUBJ-002: 35/50 (pass: 20)
      await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({ studentId, subjectId: 'SUBJ-002', marksObtained: 35 });

      // Publish result
      const resultId = `RES-${examId}-${studentId}`;
      const pubRes = await request(app)
        .post(`/api/v1/results/${resultId}/publish`)
        .send();

      expect(pubRes.status).toBe(200);
      expect(pubRes.body.success).toBe(true);
      expect(pubRes.body.data.overall.overallStatus).toBe('PASS');
      expect(pubRes.body.data.overall.totalObtainedMarks).toBe(110);
      expect(pubRes.body.data.overall.totalMaxMarks).toBe(150);
      expect(pubRes.body.data.overall.overallPercentage).toBe(73.33); // 110 / 150 * 100 = 73.33%
    });

    it('should correctly apply grace marks when student is within grace policy threshold', async () => {
      const graceStudent = 'S-102';

      // 1. Configure grace policy: max 5 marks per subject, max 5 total marks
      await request(app)
        .post(`/api/v1/exams/${examId}/grace-policy`)
        .send({
          enabled: true,
          maxGraceMarksPerSubject: 5,
          maxTotalGraceMarks: 5,
          applicableOnlyIfPassingPossible: true
        });

      // 2. Submit marks: SUBJ-001 is 37 (passing is 40 -> shortfall of 3 marks)
      await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({ studentId: graceStudent, subjectId: 'SUBJ-001', marksObtained: 37 });

      // SUBJ-002: 40/50 (clear pass)
      await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({ studentId: graceStudent, subjectId: 'SUBJ-002', marksObtained: 40 });

      // 3. Publish and check grace marks applied
      const resultId = `RES-${examId}-${graceStudent}`;
      const pubRes = await request(app)
        .post(`/api/v1/results/${resultId}/publish`)
        .send();

      expect(pubRes.status).toBe(200);
      const mathSubject = pubRes.body.data.subjects.find((s: any) => s.subjectId === 'SUBJ-001');
      expect(mathSubject.marksObtained).toBe(37);
      expect(mathSubject.graceMarks).toBe(3);
      expect(mathSubject.finalMarks).toBe(40);
      expect(mathSubject.isPassing).toBe(true);
      expect(pubRes.body.data.overall.overallStatus).toBe('PASS');
    });

    it('should NOT apply grace marks if grace policy is not configured or shortfall exceeds maxGraceMarks', async () => {
      const failStudent = 'S-103';

      // SUBJ-001 is 30 (passing is 40 -> shortfall of 10 marks; even with 5 grace, student fails)
      await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({ studentId: failStudent, subjectId: 'SUBJ-001', marksObtained: 30 });

      await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({ studentId: failStudent, subjectId: 'SUBJ-002', marksObtained: 25 });

      const resultId = `RES-${examId}-${failStudent}`;
      const pubRes = await request(app)
        .post(`/api/v1/results/${resultId}/publish`)
        .send();

      expect(pubRes.status).toBe(200);
      const mathSubject = pubRes.body.data.subjects.find((s: any) => s.subjectId === 'SUBJ-001');
      expect(mathSubject.isPassing).toBe(false);
      expect(pubRes.body.data.overall.overallStatus).toBe('FAIL');
    });
  });

  describe('Result Publishing Workflow', () => {
    it('should REJECT publication if mandatory subject marks are incomplete', async () => {
      const incompleteStudent = 'S-102';

      // Enter marks ONLY for SUBJ-001 (SUBJ-002 is missing!)
      await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({ studentId: incompleteStudent, subjectId: 'SUBJ-001', marksObtained: 80 });

      const resultId = `RES-${examId}-${incompleteStudent}`;
      const pubRes = await request(app)
        .post(`/api/v1/results/${resultId}/publish`)
        .send();

      expect(pubRes.status).toBe(422);
      expect(pubRes.body.success).toBe(false);
      expect(pubRes.body.error.code).toBe('RESULT_INCOMPLETE_MARKS');
    });

    it('should PREVENT duplicate publication of an already published result', async () => {
      // 1. Enter both marks
      await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({ studentId, subjectId: 'SUBJ-001', marksObtained: 85 });
      await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({ studentId, subjectId: 'SUBJ-002', marksObtained: 45 });

      const resultId = `RES-${examId}-${studentId}`;

      // 2. First publication succeeds
      const firstPub = await request(app)
        .post(`/api/v1/results/${resultId}/publish`)
        .send();
      expect(firstPub.status).toBe(200);
      expect(firstPub.body.data.status).toBe('PUBLISHED');

      // 3. Second publication attempt is rejected with 409 Conflict
      const secondPub = await request(app)
        .post(`/api/v1/results/${resultId}/publish`)
        .send();
      expect(secondPub.status).toBe(409);
      expect(secondPub.body.success).toBe(false);
      expect(secondPub.body.error.code).toBe('RESULT_ALREADY_PUBLISHED');
    });

    it('should LOCK published results from silent ordinary marks modification', async () => {
      // 1. Enter both marks & publish
      await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({ studentId, subjectId: 'SUBJ-001', marksObtained: 85 });
      await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({ studentId, subjectId: 'SUBJ-002', marksObtained: 45 });

      const resultId = `RES-${examId}-${studentId}`;
      await request(app).post(`/api/v1/results/${resultId}/publish`).send();

      // 2. Attempt ordinary marks submission -> must be rejected
      const modifyRes = await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({ studentId, subjectId: 'SUBJ-001', marksObtained: 95 });

      expect(modifyRes.status).toBe(422);
      expect(modifyRes.body.success).toBe(false);
      expect(modifyRes.body.error.code).toBe('RESULT_ALREADY_PUBLISHED');
    });
  });

  describe('Student Report Card Summary', () => {
    it('should return 404 for UNPUBLISHED result and never expose draft results to students', async () => {
      const draftStudent = 'S-102';

      // Enter marks, but DO NOT publish
      await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({ studentId: draftStudent, subjectId: 'SUBJ-001', marksObtained: 80 });
      await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({ studentId: draftStudent, subjectId: 'SUBJ-002', marksObtained: 40 });

      // Attempt to access student report card
      const res = await request(app)
        .get(`/api/v1/exams/${examId}/results/student/${draftStudent}`)
        .send();

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return structured report card summary once result is PUBLISHED', async () => {
      // 1. Enter marks & publish
      await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({ studentId, subjectId: 'SUBJ-001', marksObtained: 90 });
      await request(app)
        .post(`/api/v1/exams/${examId}/marks`)
        .send({ studentId, subjectId: 'SUBJ-002', marksObtained: 45 });

      const resultId = `RES-${examId}-${studentId}`;
      await request(app).post(`/api/v1/results/${resultId}/publish`).send();

      // 2. Fetch report card
      const res = await request(app)
        .get(`/api/v1/exams/${examId}/results/student/${studentId}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.studentId).toBe(studentId);
      expect(res.body.data.examId).toBe(examId);
      expect(res.body.data.subjectWiseResults).toHaveLength(2);
      expect(res.body.data.totalObtainedMarks).toBe(135);
      expect(res.body.data.totalMaxMarks).toBe(150);
      expect(res.body.data.overallPercentage).toBe(90);
      expect(res.body.data.overallResultStatus).toBe('PASS');
      expect(res.body.data.publicationStatus).toBe('PUBLISHED');
      expect(res.body.data.publishedAt).toBeDefined();
    });

    it('should return 404 if student does not exist', async () => {
      const res = await request(app)
        .get(`/api/v1/exams/${examId}/results/student/UNKNOWN-STUDENT`)
        .send();

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
