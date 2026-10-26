import { ConflictError, NotFoundError, UnprocessableEntityError } from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-codes';
import { PaginatedResult, PaginationParams } from '../../common/interfaces/pagination.interface';
import { MasterRepository } from './masters.repository';
import {
  ALLOWED_MASTER_CATEGORIES,
  BaseMasterRecord,
  CreateMasterInput,
  GradeRangeItem,
  MasterCategory,
  MasterFilters,
  MasterRecordStatus,
  UpdateMasterInput
} from './masters.types';

export interface RoomCapacityProvider {
  getRoomCapacity(roomId: string, schoolId?: string): Promise<number | null>;
  isRoomActive(roomId: string, schoolId?: string): Promise<boolean>;
}

export class MastersService implements RoomCapacityProvider {
  constructor(private readonly masterRepository: MasterRepository) {}

  private validateCategory(category: string): asserts category is MasterCategory {
    if (!ALLOWED_MASTER_CATEGORIES.includes(category as MasterCategory)) {
      throw new UnprocessableEntityError(
        `Invalid master category '${category}'. Allowed categories: ${ALLOWED_MASTER_CATEGORIES.join(', ')}`,
        ErrorCode.MASTER_CATEGORY_INVALID
      );
    }
  }

  private validateGradingRanges(ranges: GradeRangeItem[]): void {
    if (!ranges || ranges.length === 0) {
      throw new UnprocessableEntityError(
        'Grading schemes must define at least one grade range',
        ErrorCode.MASTER_INVALID_GRADE_RANGE
      );
    }

    // Sort by minPercentage ascending
    const sorted = [...ranges].sort((a, b) => a.minPercentage - b.minPercentage);

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      if (current.minPercentage < 0 || current.maxPercentage > 100) {
        throw new UnprocessableEntityError(
          `Grade range for ${current.grade} must be between 0% and 100%`,
          ErrorCode.MASTER_INVALID_GRADE_RANGE
        );
      }
      if (current.minPercentage > current.maxPercentage) {
        throw new UnprocessableEntityError(
          `minPercentage cannot exceed maxPercentage for grade ${current.grade}`,
          ErrorCode.MASTER_INVALID_GRADE_RANGE
        );
      }

      if (i > 0) {
        const prev = sorted[i - 1];
        if (current.minPercentage < prev.maxPercentage) {
          throw new UnprocessableEntityError(
            `Overlapping grade ranges detected between ${prev.grade} (${prev.minPercentage}-${prev.maxPercentage}) and ${current.grade} (${current.minPercentage}-${current.maxPercentage})`,
            ErrorCode.MASTER_INVALID_GRADE_RANGE
          );
        }
      }
    }
  }

  async getMasterRecord(category: string, id: string): Promise<BaseMasterRecord> {
    this.validateCategory(category);
    const record = await this.masterRepository.findById(category, id);
    if (!record) {
      throw new NotFoundError(
        `Master record '${id}' not found in category '${category}'`,
        ErrorCode.MASTER_RECORD_NOT_FOUND
      );
    }
    return record;
  }

  async listMasterRecords(
    category: string,
    filters: Omit<MasterFilters, 'category'> = {},
    pagination?: PaginationParams
  ): Promise<PaginatedResult<BaseMasterRecord>> {
    this.validateCategory(category);
    return this.masterRepository.findMany(
      {
        ...filters,
        category
      },
      pagination
    );
  }

  async createMasterRecord(
    category: string,
    input: Omit<CreateMasterInput, 'category'>,
    schoolId = 'SCH-001'
  ): Promise<BaseMasterRecord> {
    this.validateCategory(category);

    const targetSchoolId = input.schoolId || schoolId;
    const existing = await this.masterRepository.findByCode(category, input.code, targetSchoolId);
    if (existing) {
      throw new ConflictError(
        `Master record with code '${input.code.toUpperCase()}' already exists in category '${category}' for school '${targetSchoolId}'`,
        ErrorCode.MASTER_DUPLICATE_CODE
      );
    }

    if (category === 'grading-schemes') {
      const ranges = input.ranges || input.metadata?.ranges;
      if (!ranges) {
        throw new UnprocessableEntityError(
          'Grading scheme requires a list of valid ranges',
          ErrorCode.MASTER_INVALID_GRADE_RANGE
        );
      }
      this.validateGradingRanges(ranges);
    }

    if (category === 'examination-rooms') {
      const capacity = input.capacity ?? input.metadata?.capacity;
      if (capacity === undefined || capacity <= 0) {
        throw new UnprocessableEntityError(
          'Examination room must have a positive capacity',
          ErrorCode.VALIDATION_ERROR
        );
      }
    }

    return this.masterRepository.create({
      ...input,
      category,
      schoolId: targetSchoolId
    });
  }

  async updateMasterRecord(
    category: string,
    id: string,
    input: UpdateMasterInput
  ): Promise<BaseMasterRecord> {
    this.validateCategory(category);
    const existing = await this.getMasterRecord(category, id);

    if (category === 'grading-schemes' && (input.ranges || input.metadata?.ranges)) {
      this.validateGradingRanges(input.ranges || input.metadata?.ranges);
    }

    const updated = await this.masterRepository.update(category, existing.id, input);
    if (!updated) {
      throw new NotFoundError(
        `Master record '${id}' not found in category '${category}'`,
        ErrorCode.MASTER_RECORD_NOT_FOUND
      );
    }
    return updated;
  }

  async updateStatus(
    category: string,
    id: string,
    status: MasterRecordStatus
  ): Promise<BaseMasterRecord> {
    this.validateCategory(category);
    const existing = await this.getMasterRecord(category, id);

    const updated = await this.masterRepository.updateStatus(category, existing.id, status);
    if (!updated) {
      throw new NotFoundError(`Master record '${id}' not found`, ErrorCode.MASTER_RECORD_NOT_FOUND);
    }
    return updated;
  }

  // RoomCapacityProvider implementation
  async getRoomCapacity(roomId: string, _schoolId?: string): Promise<number | null> {
    const room = await this.masterRepository.findById('examination-rooms', roomId);
    if (!room || room.status !== 'ACTIVE') {
      return null;
    }
    const capacity = room.metadata?.capacity;
    return typeof capacity === 'number' ? capacity : null;
  }

  async isRoomActive(roomId: string, _schoolId?: string): Promise<boolean> {
    const room = await this.masterRepository.findById('examination-rooms', roomId);
    return !!room && room.status === 'ACTIVE';
  }
}
