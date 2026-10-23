import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateExamDto {
  @ApiProperty({ example: 'Annual Examination 2027' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'ay-2026' })
  @IsString()
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({ example: 'FINAL_TERM' })
  @IsString()
  @IsNotEmpty()
  term: string;

  @ApiProperty({ example: '2027-02-15' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2027-03-05' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'DRAFT', enum: ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'PUBLISHED'] })
  @IsIn(['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'PUBLISHED'])
  status: 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'PUBLISHED';
}
