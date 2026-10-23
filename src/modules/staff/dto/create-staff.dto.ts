import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({ example: 'EMP-002' })
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @ApiProperty({ example: 'Meera' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Nair' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'meera.nair@schoolerp.internal' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+919876500002' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Science' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ example: 'Physics Teacher' })
  @IsString()
  @IsNotEmpty()
  designation: string;

  @ApiProperty({ example: 'M.Sc Physics, B.Ed' })
  @IsString()
  @IsNotEmpty()
  qualification: string;

  @ApiProperty({ example: '2023-08-01' })
  @IsDateString()
  dateOfJoining: string;

  @ApiProperty({ example: 48000 })
  @IsNumber()
  @Min(0)
  salary: number;

  @ApiProperty({ example: 'SCH-001' })
  @IsString()
  @IsNotEmpty()
  schoolId: string;
}
