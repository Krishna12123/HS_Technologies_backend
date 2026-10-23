import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { IAttendanceRepository } from '../../infrastructure/repositories/interfaces/attendance-repository.interface';
import { v4 as uuidv4 } from 'uuid';

export interface QrToken {
  token: string;
  classId: string;
  sectionId: string;
  expiresAt: number; // timestamp ms
  generatedAt: number;
}

@Injectable()
export class QrAttendanceService {
  private readonly activeTokens = new Map<string, QrToken>();

  constructor(
    @Inject('IAttendanceRepository')
    private readonly attendanceRepository: IAttendanceRepository,
  ) {}

  async generateToken(classId: string, sectionId: string) {
    const token = `qr_${uuidv4().replace(/-/g, '')}`;
    const now = Date.now();
    const ttlSeconds = 60; // 60s TTL to prevent attendance spoofing
    const expiresAt = now + ttlSeconds * 1000;

    const qrToken: QrToken = {
      token,
      classId,
      sectionId,
      expiresAt,
      generatedAt: now,
    };

    this.activeTokens.set(token, qrToken);

    return {
      token,
      classId,
      sectionId,
      ttlSeconds,
      expiresAt: new Date(expiresAt).toISOString(),
    };
  }

  async verifyAndRecord(token: string, studentId: string) {
    const qrToken = this.activeTokens.get(token);
    if (!qrToken) {
      throw new BadRequestException('Invalid or expired QR token');
    }

    if (Date.now() > qrToken.expiresAt) {
      this.activeTokens.delete(token);
      throw new BadRequestException('QR code has expired. Please scan the current code.');
    }

    const today = new Date().toISOString().split('T')[0];
    const existing = await this.attendanceRepository.findByTargetAndDate('STUDENT', studentId, today);
    if (existing) {
      return {
        alreadyRecorded: true,
        record: existing,
        message: 'Attendance already verified and recorded for today.',
      };
    }

    const record = await this.attendanceRepository.create({
      studentId,
      targetType: 'STUDENT',
      date: today,
      status: 'PRESENT',
      remarks: `Self-checked in via QR code token ${token.substring(0, 8)}`,
      recordedBy: studentId,
      schoolId: 'SCH-001',
    });

    return {
      alreadyRecorded: false,
      record,
      message: 'Attendance successfully verified and recorded.',
    };
  }
}
