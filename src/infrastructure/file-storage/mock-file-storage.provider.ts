import { Injectable, Logger } from '@nestjs/common';
import { IFileStorageService } from './file-storage.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MockFileStorageProvider implements IFileStorageService {
  private readonly logger = new Logger(MockFileStorageProvider.name);
  private readonly storedFiles = new Set<string>();

  constructor() {
    this.logger.warn(
      '[DEV ONLY WARNING] MockFileStorageProvider active. Uploaded files are assigned virtual paths and not persisted to S3/GCS.',
    );
  }

  async uploadFile(file: { originalname: string; buffer: Buffer; mimetype: string }): Promise<{ fileUrl: string; fileKey: string }> {
    const fileKey = `uploads/${uuidv4()}-${file.originalname}`;
    this.storedFiles.add(fileKey);
    this.logger.log(`[STORAGE] Uploaded virtual file: ${fileKey} (${file.mimetype})`);
    return {
      fileKey,
      fileUrl: `https://storage.mock-schoolerp.internal/${fileKey}`,
    };
  }

  async getFileUrl(fileKey: string): Promise<string> {
    return `https://storage.mock-schoolerp.internal/${fileKey}`;
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    return this.storedFiles.delete(fileKey);
  }
}
