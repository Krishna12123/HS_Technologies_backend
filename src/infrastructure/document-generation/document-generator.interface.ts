export interface DocumentGenerationOptions {
  title: string;
  templateType: 'ADMIT_CARD' | 'ID_CARD' | 'BONAFIDE_CERTIFICATE' | 'TRANSFER_CERTIFICATE' | 'PAYSLIP' | 'RECEIPT' | 'REPORT_CARD';
  data: Record<string, any>;
  watermark?: string;
}

export interface GeneratedDocument {
  documentId: string;
  fileName: string;
  mimeType: string;
  downloadUrl: string;
  generatedAt: string;
}

export interface IDocumentGenerator {
  generatePdf(options: DocumentGenerationOptions): Promise<GeneratedDocument>;
}
