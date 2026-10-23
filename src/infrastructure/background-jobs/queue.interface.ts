export interface BackgroundJob<T = any> {
  id: string;
  name: string;
  data: T;
  attempts: number;
  maxRetries: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  processedAt?: Date;
  error?: string;
}

export interface IQueueService {
  enqueue<T = any>(jobName: string, data: T, maxRetries?: number): Promise<BackgroundJob<T>>;
  processJobs(): Promise<void>;
}
