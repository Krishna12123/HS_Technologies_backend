import { PaginatedResult, PaginationParams } from './pagination.interface';

export interface BaseRepository<T, CreateInput, UpdateInput, Filters = Record<string, unknown>> {
  findById(id: string): Promise<T | null>;
  findMany(filters?: Filters, pagination?: PaginationParams): Promise<PaginatedResult<T>>;
  create(data: CreateInput): Promise<T>;
  update(id: string, data: UpdateInput): Promise<T | null>;
  delete?(id: string): Promise<boolean>;
}
