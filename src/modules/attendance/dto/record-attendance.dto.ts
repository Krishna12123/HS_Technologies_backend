import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RecordAttendanceDto {
  @ApiPropertyOptional({ example: 'std-001' })
  @IsString()
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({ example: 'stf-001' })
  @IsString()
  @IsOptional()
  staffId?: string;

  @ApiProperty({ example: 'STUDENT', enum: ['STUDENT', 'STAFF'] })
  @IsIn(['STUDENT', 'STAFF'])
  targetType: 'STUDENT' | 'STAFF';

  @ApiProperty({ example: '2026-10-24' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'PRESENT', enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] })
  @IsIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'])
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

  @ApiPropertyOptional({ example: 'Arrived 10 minutes late due to traffic' })
  @IsString()
  @IsOptional()
  remarks?: string;
}
