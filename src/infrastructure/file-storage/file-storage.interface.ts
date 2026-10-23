export interface IFileStorageService {
  uploadFile(file: { originalname: string; buffer: Buffer; mimetype: string }): Promise<{ fileUrl: string; fileKey: string }>;
  getFileUrl(fileKey: string): Promise<string>;
  deleteFile(fileKey: string): Promise<boolean>;
}
