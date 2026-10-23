import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsString, IsIn } from 'class-validator';

export class AdmissionApplicationDto {
  @ApiProperty({ example: 'Rohan' })
  @IsString()
  @IsNotEmpty()
  candidateFirstName: string;

  @ApiProperty({ example: 'Mehra' })
  @IsString()
  @IsNotEmpty()
  candidateLastName: string;

  @ApiProperty({ example: '2014-06-15' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'MALE', enum: ['MALE', 'FEMALE', 'OTHER'] })
  @IsIn(['MALE', 'FEMALE', 'OTHER'])
  gender: string;

  @ApiProperty({ example: 'cls-10' })
  @IsString()
  @IsNotEmpty()
  appliedClassId: string;

  @ApiProperty({ example: 'parent.mehra@example.com' })
  @IsEmail()
  parentEmail: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  parentPhone: string;

  @ApiProperty({ example: 'Previous School Name or Transfer Info' })
  @IsString()
  @IsNotEmpty()
  previousSchool: string;
}
