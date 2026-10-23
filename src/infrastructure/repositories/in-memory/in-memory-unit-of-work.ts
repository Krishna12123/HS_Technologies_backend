import { Injectable, Logger } from '@nestjs/common';
import { IUnitOfWork } from '../interfaces/unit-of-work.interface';

@Injectable()
export class InMemoryUnitOfWork implements IUnitOfWork {
  private readonly logger = new Logger(InMemoryUnitOfWork.name);
  private isTransactionActive = false;

  async startTransaction(): Promise<void> {
    this.isTransactionActive = true;
    this.logger.debug('[UoW] Simulated in-memory transaction started.');
  }

  async commit(): Promise<void> {
    this.isTransactionActive = false;
    this.logger.debug('[UoW] Simulated in-memory transaction committed.');
  }

  async rollback(): Promise<void> {
    this.isTransactionActive = false;
    this.logger.warn('[UoW] Simulated in-memory transaction rolled back.');
  }

  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    await this.startTransaction();
    try {
      const result = await work();
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }
}
