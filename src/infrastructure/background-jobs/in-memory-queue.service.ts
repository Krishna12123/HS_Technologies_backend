import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { IQueueService, BackgroundJob } from './queue.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InMemoryQueueService implements IQueueService, OnApplicationShutdown {
  private readonly logger = new Logger(InMemoryQueueService.name);
  private readonly jobs: BackgroundJob[] = [];
  private isShuttingDown = false;

  constructor() {
    this.logger.warn(
      '[DEV ONLY WARNING] InMemoryQueueService active. BullMQ/Redis adapter is abstracted with in-memory runner.',
    );
  }

  async enqueue<T = any>(jobName: string, data: T, maxRetries = 3): Promise<BackgroundJob<T>> {
    const job: BackgroundJob<T> = {
      id: uuidv4(),
      name: jobName,
      data,
      attempts: 0,
      maxRetries,
      status: 'PENDING',
      createdAt: new Date(),
    };
    this.jobs.push(job);
    this.logger.log(`[QUEUE] Enqueued job '${jobName}' (ID: ${job.id})`);

    // In-memory immediate trigger simulation
    setImmediate(() => this.processSingleJob(job));

    return job;
  }

  private async processSingleJob(job: BackgroundJob) {
    if (this.isShuttingDown) return;
    job.status = 'PROCESSING';
    job.attempts += 1;
    this.logger.debug(`[QUEUE] Processing job '${job.name}' (Attempt ${job.attempts}/${job.maxRetries})`);

    try {
      // Simulated work delay
      await new Promise((resolve) => setTimeout(resolve, 50));
      job.status = 'COMPLETED';
      job.processedAt = new Date();
      this.logger.log(`[QUEUE] Successfully executed job '${job.name}' (ID: ${job.id})`);
    } catch (err: any) {
      job.error = err.message;
      if (job.attempts < job.maxRetries) {
        job.status = 'PENDING';
        this.logger.warn(`[QUEUE] Job '${job.name}' failed. Retrying...`);
      } else {
        job.status = 'FAILED';
        this.logger.error(`[QUEUE] Job '${job.name}' permanently failed after ${job.attempts} attempts.`);
      }
    }
  }

  async processJobs(): Promise<void> {
    const pending = this.jobs.filter((j) => j.status === 'PENDING');
    for (const job of pending) {
      await this.processSingleJob(job);
    }
  }

  onApplicationShutdown(signal?: string) {
    this.isShuttingDown = true;
    this.logger.log(`[QUEUE] Graceful queue shutdown received (Signal: ${signal}).`);
  }
}
