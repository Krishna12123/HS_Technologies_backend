import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'ADM-2026-003' })
  @IsString()
  @IsNotEmpty()
  admissionNumber: string;

  @ApiProperty({ example: 'Arya' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Stark' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '2013-04-12' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'FEMALE', enum: ['MALE', 'FEMALE', 'OTHER'] })
  @IsIn(['MALE', 'FEMALE', 'OTHER'])
  gender: string;

  @ApiProperty({ example: 'cls-10' })
  @IsString()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ example: 'sec-a' })
  @IsString()
  @IsNotEmpty()
  sectionId: string;

  @ApiProperty({ example: 'ay-2026' })
  @IsString()
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({ example: 'parent.stark@winterfell.internal' })
  @IsEmail()
  parentEmail: string;

  @ApiProperty({ example: '+919876500000' })
  @IsString()
  @IsNotEmpty()
  parentPhone: string;

  @ApiProperty({ example: 'The Great Keep, Winterfell' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'SCH-001' })
  @IsString()
  @IsNotEmpty()
  schoolId: string;
}
