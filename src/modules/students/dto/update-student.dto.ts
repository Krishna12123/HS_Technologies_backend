import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateStudentDto {
  @ApiPropertyOptional({ example: 'Arya' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Stark' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: 'cls-10' })
  @IsString()
  @IsOptional()
  classId?: string;

  @ApiPropertyOptional({ example: 'sec-b' })
  @IsString()
  @IsOptional()
  sectionId?: string;

  @ApiPropertyOptional({ example: 'parent.updated@winterfell.internal' })
  @IsEmail()
  @IsOptional()
  parentEmail?: string;

  @ApiPropertyOptional({ example: '+919876500001' })
  @IsString()
  @IsOptional()
  parentPhone?: string;

  @ApiPropertyOptional({ example: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'TRANSFERRED', 'GRADUATED'] })
  @IsIn(['ACTIVE', 'INACTIVE', 'TRANSFERRED', 'GRADUATED'])
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'GRADUATED';
}
