import { ConflictError, UnprocessableEntityError } from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-codes';
import { hasTimeOverlap, isValidTimeRange } from '../../common/utils/date.util';
import { RoomCapacityProvider } from '../masters/masters.service';
import { ExamRepository } from './examinations.repository';

export interface ScheduleValidationRequest {
  startTime: string;
  endTime: string;
  roomId: string;
  invigilatorIds: string[];
  studentCount: number;
  excludeScheduleId?: string;
  schoolId?: string;
}

export class SchedulingEngineService {
  constructor(
    private readonly examRepository: ExamRepository,
    private readonly roomCapacityProvider: RoomCapacityProvider
  ) {}

  /**
   * Validate all 5 conflict and scheduling rules.
   * Throws appropriate domain AppError if any rule is violated.
   */
  async validateSchedule(request: ScheduleValidationRequest): Promise<void> {
    const { startTime, endTime, roomId, invigilatorIds, studentCount, excludeScheduleId, schoolId } = request;

    // Rule 4: Valid Time Ranges
    this.validateTimeRange(startTime, endTime);

    // Rule 3: Room Capacity & Room Availability Check
    await this.validateRoomCapacity(roomId, studentCount, schoolId);

    // Fetch all potentially overlapping active schedules
    const activeSchedules = await this.examRepository.findActiveSchedulesInTimeRange(
      startTime,
      endTime,
      excludeScheduleId
    );

    for (const existing of activeSchedules) {
      const isOverlapping = hasTimeOverlap(existing.startTime, existing.endTime, startTime, endTime);
      if (!isOverlapping) {
        continue;
      }

      // Rule 1: Room Conflict
      // Reject schedule if the same room is already booked for an overlapping exam
      if (existing.roomId === roomId) {
        throw new ConflictError(
          `Room conflict detected: Room '${roomId}' is already booked from ${existing.startTime} to ${existing.endTime} by schedule '${existing.id}'.`,
          ErrorCode.EXAM_ROOM_CONFLICT,
          [
            {
              field: 'roomId',
              message: `Room is currently occupied by schedule ${existing.id}`,
              code: ErrorCode.EXAM_ROOM_CONFLICT
            }
          ]
        );
      }

      // Rule 2: Invigilator Conflict
      // An invigilator cannot supervise two overlapping examinations
      for (const invigilatorId of invigilatorIds) {
        if (existing.invigilatorIds.includes(invigilatorId)) {
          throw new ConflictError(
            `Invigilator conflict detected: Invigilator '${invigilatorId}' is already assigned to schedule '${existing.id}' from ${existing.startTime} to ${existing.endTime}.`,
            ErrorCode.EXAM_INVIGILATOR_CONFLICT,
            [
              {
                field: 'invigilatorIds',
                message: `Invigilator ${invigilatorId} is busy in schedule ${existing.id}`,
                code: ErrorCode.EXAM_INVIGILATOR_CONFLICT
              }
            ]
          );
        }
      }
    }
  }

  private validateTimeRange(startTime: string, endTime: string): void {
    if (!startTime || !endTime) {
      throw new UnprocessableEntityError(
        'Both startTime and endTime are required for an examination schedule',
        ErrorCode.EXAM_INVALID_TIME_RANGE
      );
    }

    if (!isValidTimeRange(startTime, endTime)) {
      throw new UnprocessableEntityError(
        'Invalid time range: endTime must be strictly greater than startTime and dates must be valid ISO 8601 strings',
        ErrorCode.EXAM_INVALID_TIME_RANGE
      );
    }

    const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
    if (durationMs <= 0) {
      throw new UnprocessableEntityError(
        'Examination duration cannot be zero or negative',
        ErrorCode.EXAM_INVALID_TIME_RANGE
      );
    }
  }

  private async validateRoomCapacity(roomId: string, studentCount: number, schoolId?: string): Promise<void> {
    if (studentCount <= 0) {
      throw new UnprocessableEntityError(
        'Student count must be a positive number',
        ErrorCode.VALIDATION_ERROR
      );
    }

    const isActive = await this.roomCapacityProvider.isRoomActive(roomId, schoolId);
    if (!isActive) {
      throw new UnprocessableEntityError(
        `Selected room '${roomId}' is inactive or does not exist in master records`,
        ErrorCode.MASTER_RECORD_NOT_FOUND
      );
    }

    const capacity = await this.roomCapacityProvider.getRoomCapacity(roomId, schoolId);
    if (capacity === null) {
      throw new UnprocessableEntityError(
        `Room capacity configuration not found for room '${roomId}'`,
        ErrorCode.MASTER_RECORD_NOT_FOUND
      );
    }

    if (studentCount > capacity) {
      throw new UnprocessableEntityError(
        `Room capacity exceeded: Room '${roomId}' has a capacity of ${capacity}, but ${studentCount} students were requested.`,
        ErrorCode.EXAM_ROOM_CAPACITY_EXCEEDED,
        [
          {
            field: 'studentCount',
            message: `Required ${studentCount} exceeds maximum room capacity of ${capacity}`,
            code: ErrorCode.EXAM_ROOM_CAPACITY_EXCEEDED
          }
        ]
      );
    }
  }
}
