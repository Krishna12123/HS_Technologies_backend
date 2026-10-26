import { BadRequestError, UnprocessableEntityError } from '../../common/errors/app-error';
import { ErrorCode } from '../../common/errors/error-codes';
import { CreateGradingCriteriaInput, GradeBoundary, GradingCriteriaConfig } from './examinations.types';

export class GradingCriteriaService {
  private configs: Map<string, GradingCriteriaConfig> = new Map();
  private seq = 1;

  constructor() {
    this.seedDefaultConfig();
  }

  private seedDefaultConfig(): void {
    const defaultBoundaries: GradeBoundary[] = [
      { grade: 'A1', minPercentage: 91, maxPercentage: 100, isPassing: true, gradePoint: 10, remarks: 'Outstanding' },
      { grade: 'A2', minPercentage: 81, maxPercentage: 90.99, isPassing: true, gradePoint: 9, remarks: 'Excellent' },
      { grade: 'B1', minPercentage: 71, maxPercentage: 80.99, isPassing: true, gradePoint: 8, remarks: 'Very Good' },
      { grade: 'B2', minPercentage: 61, maxPercentage: 70.99, isPassing: true, gradePoint: 7, remarks: 'Good' },
      { grade: 'C1', minPercentage: 51, maxPercentage: 60.99, isPassing: true, gradePoint: 6, remarks: 'Fair' },
      { grade: 'C2', minPercentage: 41, maxPercentage: 50.99, isPassing: true, gradePoint: 5, remarks: 'Average' },
      { grade: 'D', minPercentage: 33, maxPercentage: 40.99, isPassing: true, gradePoint: 4, remarks: 'Pass' },
      { grade: 'E', minPercentage: 0, maxPercentage: 32.99, isPassing: false, gradePoint: 0, remarks: 'Needs Improvement' }
    ];

    this.createGradingConfig({
      name: 'Standard CBSE/School Grading Scheme',
      minScale: 0,
      maxScale: 100,
      boundaries: defaultBoundaries
    });
  }

  /**
   * Validate that grade boundaries:
   * 1. Have minPercentage <= maxPercentage
   * 2. Fall within [minScale, maxScale]
   * 3. Do not overlap with one another
   */
  public validateBoundaries(
    boundaries: GradeBoundary[],
    minScale = 0,
    maxScale = 100
  ): void {
    if (!boundaries || boundaries.length === 0) {
      throw new BadRequestError('Grading criteria must have at least one grade boundary', ErrorCode.VALIDATION_ERROR);
    }

    // Sort descending by minPercentage for clear overlap check
    const sorted = [...boundaries].sort((a, b) => b.minPercentage - a.minPercentage);

    for (let i = 0; i < sorted.length; i++) {
      const b = sorted[i];

      if (typeof b.minPercentage !== 'number' || typeof b.maxPercentage !== 'number') {
        throw new BadRequestError(`Boundary for grade '${b.grade}' must have numeric percentages`, ErrorCode.VALIDATION_ERROR);
      }

      if (b.minPercentage > b.maxPercentage) {
        throw new BadRequestError(
          `Invalid grade range for grade '${b.grade}': minPercentage (${b.minPercentage}) exceeds maxPercentage (${b.maxPercentage})`,
          ErrorCode.VALIDATION_ERROR,
          [{ field: 'boundaries', message: `minPercentage > maxPercentage for ${b.grade}`, code: ErrorCode.VALIDATION_ERROR }]
        );
      }

      if (b.minPercentage < minScale || b.maxPercentage > maxScale) {
        throw new BadRequestError(
          `Grade '${b.grade}' range [${b.minPercentage}, ${b.maxPercentage}] falls outside marking scale [${minScale}, ${maxScale}]`,
          ErrorCode.VALIDATION_ERROR,
          [{ field: 'boundaries', message: `Range outside marking scale`, code: ErrorCode.VALIDATION_ERROR }]
        );
      }

      // Check overlap with next lower range
      if (i < sorted.length - 1) {
        const next = sorted[i + 1];
        if (b.minPercentage <= next.maxPercentage) {
          throw new UnprocessableEntityError(
            `Overlapping grade ranges detected between grade '${b.grade}' [${b.minPercentage}, ${b.maxPercentage}] and grade '${next.grade}' [${next.minPercentage}, ${next.maxPercentage}]`,
            ErrorCode.RESULT_GRADING_CONFIG_INVALID,
            [{ field: 'boundaries', message: `Overlapping ranges between ${b.grade} and ${next.grade}`, code: ErrorCode.RESULT_GRADING_CONFIG_INVALID }]
          );
        }
      }
    }
  }

  public createGradingConfig(input: CreateGradingCriteriaInput): GradingCriteriaConfig {
    const minScale = input.minScale !== undefined ? input.minScale : 0;
    const maxScale = input.maxScale !== undefined ? input.maxScale : 100;

    this.validateBoundaries(input.boundaries, minScale, maxScale);

    const id = `GC-${String(this.seq++).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const config: GradingCriteriaConfig = {
      id,
      examId: input.examId,
      name: input.name,
      minScale,
      maxScale,
      boundaries: input.boundaries,
      createdAt: now,
      updatedAt: now
    };

    this.configs.set(id, config);
    return config;
  }

  public getConfigById(id: string): GradingCriteriaConfig | null {
    return this.configs.get(id) || null;
  }

  public getDefaultConfig(): GradingCriteriaConfig {
    const first = Array.from(this.configs.values())[0];
    return first;
  }

  public listConfigs(): GradingCriteriaConfig[] {
    return Array.from(this.configs.values());
  }
}
