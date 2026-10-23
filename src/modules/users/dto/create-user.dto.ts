import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'staff.new@schoolerp.internal' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Aarav' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Patel' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'TEACHER',
    enum: [
      'SUPER_ADMIN',
      'SCHOOL_ADMIN',
      'ACCOUNTANT',
      'TEACHER',
      'HR_STAFF',
      'LIBRARIAN',
      'TRANSPORT_MANAGER',
      'FRONT_DESK',
      'PARENT',
      'STUDENT',
    ],
  })
  @IsIn([
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'ACCOUNTANT',
    'TEACHER',
    'HR_STAFF',
    'LIBRARIAN',
    'TRANSPORT_MANAGER',
    'FRONT_DESK',
    'PARENT',
    'STUDENT',
  ])
  role: string;

  @ApiProperty({ example: 'SCH-001' })
  @IsString()
  @IsNotEmpty()
  schoolId: string;
}
