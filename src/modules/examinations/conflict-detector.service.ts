import {
  BadRequestError,
  ConflictError,
  UnprocessableEntityError
} from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-codes';
import { Examination, ExamSchedule } from './examinations.types';

export interface ProposedSchedule {
  examId: string;
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
  roomId: string;
  invigilatorIds: string[];
  studentCount: number;
  excludeScheduleId?: string;
}

export interface RoomInfo {
  id: string;
  name?: string;
  capacity: number;
  isActive: boolean;
}

export class ConflictDetectorService {
  /**
   * Helper to convert date and time representation into an absolute millisecond timestamp.
   * Handles both ISO 8601 strings and separate "YYYY-MM-DD" + "HH:mm(:ss)" formats.
   */
  public parseToTimestamp(dateStr: string, timeStr: string): number {
    if (timeStr.includes('T')) {
      const ts = new Date(timeStr).getTime();
      if (isNaN(ts)) {
        throw new BadRequestError(
          `Invalid ISO timestamp: '${timeStr}'`,
          ErrorCode.INVALID_TIME_RANGE,
          [{ field: 'startTime', message: 'Invalid ISO timestamp format', code: ErrorCode.INVALID_TIME_RANGE }]
        );
      }
      return ts;
    }

    const cleanTime = timeStr.trim().length === 5 ? `${timeStr.trim()}:00` : timeStr.trim();
    const isoCombined = `${dateStr.trim()}T${cleanTime}`;
    const ts = new Date(isoCombined).getTime();
    if (isNaN(ts)) {
      throw new BadRequestError(
        `Invalid date/time combination: '${isoCombined}'`,
        ErrorCode.INVALID_TIME_RANGE,
        [{ field: 'time', message: 'Invalid date/time string', code: ErrorCode.INVALID_TIME_RANGE }]
      );
    }
    return ts;
  }

  /**
   * Half-open interval overlap check: [start, end)
   * Formula: existingStart < requestedEnd && requestedStart < existingEnd
   */
  public hasOverlap(
    startA: number,
    endA: number,
    startB: number,
    endB: number
  ): boolean {
    return startA < endB && startB < endA;
  }

  /**
   * Check all 5 mandatory business rules.
   * Throws domain-specific AppErrors with exact conflict error codes:
   * - INVALID_TIME_RANGE
   * - ROOM_CONFLICT
   * - TEACHER_CONFLICT
   * - HALL_CAPACITY_EXCEEDED
   * - INVALID_EXAM_OR_SUBJECT
   */
  public validate(
    proposed: ProposedSchedule,
    exam: Examination,
    room: RoomInfo,
    existingSchedules: ExamSchedule[]
  ): void {
    // Rule 5 part A: Exam and Subject validation
    if (!exam) {
      throw new BadRequestError(
        `Referenced examination '${proposed.examId}' not found`,
        ErrorCode.INVALID_EXAM_OR_SUBJECT,
        [{ field: 'examId', message: 'Examination does not exist', code: ErrorCode.INVALID_EXAM_OR_SUBJECT }]
      );
    }

    const subjectInExam = exam.subjects.find((s) => s.subjectId === proposed.subjectId);
    if (!subjectInExam) {
      throw new BadRequestError(
        `Subject '${proposed.subjectId}' does not belong to examination '${exam.name}'`,
        ErrorCode.INVALID_EXAM_OR_SUBJECT,
        [{ field: 'subjectId', message: 'Subject is not registered in this exam', code: ErrorCode.INVALID_EXAM_OR_SUBJECT }]
      );
    }

    // Rule 1: Time Validation
    const requestedStart = this.parseToTimestamp(proposed.date, proposed.startTime);
    const requestedEnd = this.parseToTimestamp(proposed.date, proposed.endTime);

    if (requestedStart >= requestedEnd) {
      throw new BadRequestError(
        `Invalid time range: startTime (${proposed.startTime}) must be strictly earlier than endTime (${proposed.endTime})`,
        ErrorCode.INVALID_TIME_RANGE,
        [{ field: 'startTime', message: 'Start time must be before end time', code: ErrorCode.INVALID_TIME_RANGE }]
      );
    }

    // Check if proposed date falls within exam's permitted range
    const scheduleDate = new Date(proposed.date).toISOString().slice(0, 10);
    const examStartDate = new Date(exam.startDate).toISOString().slice(0, 10);
    const examEndDate = new Date(exam.endDate).toISOString().slice(0, 10);

    if (scheduleDate < examStartDate || scheduleDate > examEndDate) {
      throw new BadRequestError(
        `Schedule date '${proposed.date}' falls outside examination permitted date range (${examStartDate} to ${examEndDate})`,
        ErrorCode.INVALID_TIME_RANGE,
        [{ field: 'date', message: 'Schedule date outside exam window', code: ErrorCode.INVALID_TIME_RANGE }]
      );
    }

    // Rule 4: Hall Capacity Validation
    if (!room) {
      throw new BadRequestError(
        `Assigned hall or room '${proposed.roomId}' not found`,
        ErrorCode.INVALID_EXAM_OR_SUBJECT,
        [{ field: 'roomId', message: 'Room not found', code: ErrorCode.INVALID_EXAM_OR_SUBJECT }]
      );
    }

    if (!room.isActive) {
      throw new UnprocessableEntityError(
        `Assigned room '${proposed.roomId}' is currently inactive`,
        ErrorCode.UNPROCESSABLE_ENTITY,
        [{ field: 'roomId', message: 'Room is inactive', code: ErrorCode.UNPROCESSABLE_ENTITY }]
      );
    }

    if (proposed.studentCount <= 0) {
      throw new BadRequestError(
        'Student count must be greater than zero',
        ErrorCode.VALIDATION_ERROR,
        [{ field: 'studentCount', message: 'Student count must be positive', code: ErrorCode.VALIDATION_ERROR }]
      );
    }

    if (proposed.studentCount > room.capacity) {
      throw new UnprocessableEntityError(
        `Hall capacity exceeded: Room '${proposed.roomId}' capacity is ${room.capacity}, but ${proposed.studentCount} students are required`,
        ErrorCode.HALL_CAPACITY_EXCEEDED,
        [{
          field: 'studentCount',
          message: `Required capacity ${proposed.studentCount} exceeds hall capacity ${room.capacity}`,
          code: ErrorCode.HALL_CAPACITY_EXCEEDED
        }]
      );
    }

    // Check overlaps with active existing schedules
    for (const existing of existingSchedules) {
      // Exclude self if updating
      if (proposed.excludeScheduleId && existing.id === proposed.excludeScheduleId) {
        continue;
      }

      if (existing.status === 'CANCELLED') {
        continue;
      }

      const existingStart = this.parseToTimestamp(existing.date, existing.startTime);
      const existingEnd = this.parseToTimestamp(existing.date, existing.endTime);

      const isOverlapping = this.hasOverlap(existingStart, existingEnd, requestedStart, requestedEnd);
      if (!isOverlapping) {
        continue;
      }

      // Rule 2: Room Double-Booking Prevention
      if (existing.roomId === proposed.roomId) {
        throw new ConflictError(
          `Room conflict detected: Room '${proposed.roomId}' is already booked from ${existing.startTime} to ${existing.endTime} by schedule '${existing.id}'`,
          ErrorCode.ROOM_CONFLICT,
          [{
            field: 'roomId',
            message: `Room ${proposed.roomId} already in use by schedule ${existing.id}`,
            code: ErrorCode.ROOM_CONFLICT
          }]
        );
      }

      // Rule 3: Teacher/Invigilator Conflict Prevention
      for (const invigilatorId of proposed.invigilatorIds) {
        if (existing.invigilatorIds.includes(invigilatorId)) {
          throw new ConflictError(
            `Teacher conflict detected: Teacher/Invigilator '${invigilatorId}' is already assigned to schedule '${existing.id}' from ${existing.startTime} to ${existing.endTime}`,
            ErrorCode.TEACHER_CONFLICT,
            [{
              field: 'invigilatorIds',
              message: `Invigilator ${invigilatorId} is busy in schedule ${existing.id}`,
              code: ErrorCode.TEACHER_CONFLICT
            }]
          );
        }
      }
    }
  }
}
