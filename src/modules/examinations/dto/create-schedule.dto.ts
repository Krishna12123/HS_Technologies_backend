import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateExamScheduleDto {
  @ApiProperty({ example: 'sbj-math' })
  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: 'cls-10' })
  @IsString()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ example: '2027-02-16' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '12:00' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: 'Hall-B' })
  @IsString()
  @IsNotEmpty()
  roomNumber: string;

  @ApiProperty({ example: 'stf-001' })
  @IsString()
  @IsNotEmpty()
  invigilatorStaffId: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  maxMarks: number;

  @ApiProperty({ example: 40 })
  @IsNumber()
  @Min(1)
  passMarks: number;
}
