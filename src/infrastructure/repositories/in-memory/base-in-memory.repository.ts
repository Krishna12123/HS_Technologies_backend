import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IBaseRepository } from '../interfaces/base-repository.interface';

export abstract class BaseInMemoryRepository<T extends { id: string; createdAt?: Date; updatedAt?: Date }>
  implements IBaseRepository<T>
{
  protected readonly items = new Map<string, T>();
  protected readonly logger: Logger;

  constructor(repositoryName: string) {
    this.logger = new Logger(repositoryName);
    this.logger.warn(
      `[DEV ONLY WARNING] ${repositoryName} initialized in MEMORY mode. Data is volatile and will NOT persist across restarts!`,
    );
  }

  async findById(id: string): Promise<T | null> {
    const item = this.items.get(id);
    return item ? { ...item } : null;
  }

  async findAll(filter?: Record<string, any>): Promise<T[]> {
    let result = Array.from(this.items.values());
    if (filter) {
      result = result.filter((item) => {
        return Object.entries(filter).every(([key, val]) => (item as any)[key] === val);
      });
    }
    return result.map((item) => ({ ...item }));
  }

  async create(entity: Partial<T>): Promise<T> {
    const now = new Date();
    const id = entity.id || uuidv4();
    const newItem = {
      ...entity,
      id,
      createdAt: now,
      updatedAt: now,
    } as T;
    this.items.set(id, newItem);
    return { ...newItem };
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const existing = this.items.get(id);
    if (!existing) {
      throw new Error(`Item with id '${id}' not found`);
    }
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.items.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  async count(filter?: Record<string, any>): Promise<number> {
    const items = await this.findAll(filter);
    return items.length;
  }
}
