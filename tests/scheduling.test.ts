import request from 'supertest';
import { createApp } from '../src/app';

describe('Day 1 - Examination & Scheduling Conflict Engine Tests', () => {
  let app: any;
  let examId: string;

  beforeEach(async () => {
    const instance = createApp();
    app = instance.app;

    // Create a standard test examination
    const res = await request(app)
      .post('/api/v1/exams')
      .send({
        name: 'Term 1 Final Examination',
        academicYear: '2026-2027',
        examPeriod: 'Term 1',
        examType: 'Standard Theory',
        classId: 'CLASS-10',
        sectionId: 'SEC-A',
        subjects: [
          { subjectId: 'SUBJ-001', subjectName: 'Mathematics', maxMarks: 100, passMarks: 40 },
          { subjectId: 'SUBJ-002', subjectName: 'Physics Practical', maxMarks: 50, passMarks: 20 }
        ],
        startDate: '2026-11-01',
        endDate: '2026-11-30'
      });

    examId = res.body.data.id;
  });

  describe('Rule 1: Valid Schedule & Time Range', () => {
    it('should create a valid examination schedule within permitted exam window', async () => {
      const res = await request(app)
        .post(`/api/v1/exams/${examId}/schedules`)
        .send({
          subjectId: 'SUBJ-001',
          date: '2026-11-10',
          startTime: '09:00',
          endTime: '11:00',
          roomId: 'ROOM-101', // capacity 40
          studentCount: 35,
          invigilatorIds: ['T-101']
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.examId).toBe(examId);
      expect(res.body.data.roomId).toBe('ROOM-101');
      expect(res.body.data.status).toBe('SCHEDULED');
    });

    it('should reject schedule when startTime is later than or equal to endTime', async () => {
      const res = await request(app)
        .post(`/api/v1/exams/${examId}/schedules`)
        .send({
          subjectId: 'SUBJ-001',
          date: '2026-11-10',
          startTime: '12:00',
          endTime: '10:00', // End before start!
          roomId: 'ROOM-101',
          studentCount: 30,
          invigilatorIds: ['T-101']
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TIME_RANGE');
    });

    it('should reject schedule when date is outside permitted examination date range', async () => {
      const res = await request(app)
        .post(`/api/v1/exams/${examId}/schedules`)
        .send({
          subjectId: 'SUBJ-001',
          date: '2026-12-05', // Exam is in November!
          startTime: '09:00',
          endTime: '11:00',
          roomId: 'ROOM-101',
          studentCount: 30,
          invigilatorIds: ['T-101']
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TIME_RANGE');
    });
  });

  describe('Rule 2: Room Double-Booking & Half-Open Intervals', () => {
    beforeEach(async () => {
      // Schedule Room-101 from 09:00 to 11:00
      await request(app)
        .post(`/api/v1/exams/${examId}/schedules`)
        .send({
          subjectId: 'SUBJ-001',
          date: '2026-11-15',
          startTime: '09:00',
          endTime: '11:00',
          roomId: 'ROOM-101',
          studentCount: 30,
          invigilatorIds: ['T-101']
        });
    });

    it('should reject overlapping schedule in the same room (ROOM_CONFLICT)', async () => {
      // Attempt booking Room-101 from 10:00 to 12:00 (overlaps 10:00-11:00)
      const res = await request(app)
        .post(`/api/v1/exams/${examId}/schedules`)
        .send({
          subjectId: 'SUBJ-002',
          date: '2026-11-15',
          startTime: '10:00',
          endTime: '12:00',
          roomId: 'ROOM-101',
          studentCount: 25,
          invigilatorIds: ['T-102']
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ROOM_CONFLICT');
    });

    it('should ALLOW two examinations scheduled consecutively without overlap (half-open [start, end))', async () => {
      // Booking Room-101 starting EXACTLY at 11:00 to 13:00 (Previous ends at 11:00)
      const res = await request(app)
        .post(`/api/v1/exams/${examId}/schedules`)
        .send({
          subjectId: 'SUBJ-002',
          date: '2026-11-15',
          startTime: '11:00',
          endTime: '13:00',
          roomId: 'ROOM-101',
          studentCount: 25,
          invigilatorIds: ['T-102']
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.startTime).toBe('11:00');
    });
  });

  describe('Rule 3: Teacher / Invigilator Conflict Prevention', () => {
    it('should reject scheduling when same teacher is assigned to overlapping examinations (TEACHER_CONFLICT)', async () => {
      // 1. First schedule in ROOM-101 with Teacher T-101 from 09:00 to 11:00
      await request(app)
        .post(`/api/v1/exams/${examId}/schedules`)
        .send({
          subjectId: 'SUBJ-001',
          date: '2026-11-18',
          startTime: '09:00',
          endTime: '11:00',
          roomId: 'ROOM-101',
          studentCount: 30,
          invigilatorIds: ['T-101']
        });

      // 2. Second schedule in DIFFERENT room ROOM-102 but with SAME Teacher T-101 during overlapping 09:30 to 11:30
      const res = await request(app)
        .post(`/api/v1/exams/${examId}/schedules`)
        .send({
          subjectId: 'SUBJ-002',
          date: '2026-11-18',
          startTime: '09:30',
          endTime: '11:30',
          roomId: 'ROOM-102',
          studentCount: 20,
          invigilatorIds: ['T-101'] // Conflict!
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TEACHER_CONFLICT');
    });
  });

  describe('Rule 4: Hall Capacity Validation', () => {
    it('should reject schedule when requested students exceed hall capacity (HALL_CAPACITY_EXCEEDED)', async () => {
      // ROOM-102 capacity is 30. Requesting 35 students!
      const res = await request(app)
        .post(`/api/v1/exams/${examId}/schedules`)
        .send({
          subjectId: 'SUBJ-001',
          date: '2026-11-20',
          startTime: '09:00',
          endTime: '11:00',
          roomId: 'ROOM-102',
          studentCount: 35, // 35 > 30!
          invigilatorIds: ['T-102']
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('HALL_CAPACITY_EXCEEDED');
    });
  });

  describe('Rule 5: Missing References & Integrity', () => {
    it('should reject schedule when subject does not belong to the examination', async () => {
      const res = await request(app)
        .post(`/api/v1/exams/${examId}/schedules`)
        .send({
          subjectId: 'NON-REGISTERED-SUBJ',
          date: '2026-11-20',
          startTime: '09:00',
          endTime: '11:00',
          roomId: 'ROOM-101',
          studentCount: 25,
          invigilatorIds: ['T-101']
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_EXAM_OR_SUBJECT');
    });

    it('should reject schedule when examination does not exist', async () => {
      const res = await request(app)
        .post('/api/v1/exams/NON-EXISTENT-EXAM/schedules')
        .send({
          subjectId: 'SUBJ-001',
          date: '2026-11-20',
          startTime: '09:00',
          endTime: '11:00',
          roomId: 'ROOM-101',
          studentCount: 25,
          invigilatorIds: ['T-101']
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_EXAM_OR_SUBJECT');
    });
  });
});
