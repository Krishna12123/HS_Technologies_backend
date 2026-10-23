import { Injectable, Logger } from '@nestjs/common';
import {
  IDocumentGenerator,
  DocumentGenerationOptions,
  GeneratedDocument,
} from './document-generator.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MockDocumentGenerator implements IDocumentGenerator {
  private readonly logger = new Logger(MockDocumentGenerator.name);

  constructor() {
    this.logger.warn(
      '[DEV ONLY WARNING] MockDocumentGenerator active. Real PDF rendering engine is substituted with mock documents.',
    );
  }

  async generatePdf(options: DocumentGenerationOptions): Promise<GeneratedDocument> {
    const documentId = `doc-${uuidv4()}`;
    const fileName = `${options.templateType.toLowerCase()}_${documentId.substring(0, 8)}.pdf`;

    this.logger.log(`[MOCK DOC GEN] Generated PDF document '${fileName}' for template: ${options.templateType}`);

    return {
      documentId,
      fileName,
      mimeType: 'application/pdf',
      downloadUrl: `/api/v1/mock-storage/documents/${fileName}`,
      generatedAt: new Date().toISOString(),
    };
  }
}
