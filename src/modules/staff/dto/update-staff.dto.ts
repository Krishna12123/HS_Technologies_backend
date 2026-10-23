import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNumber, IsOptional, IsString, IsIn, Min } from 'class-validator';

export class UpdateStaffDto {
  @ApiPropertyOptional({ example: 'Meera' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Nair' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '+919876500003' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Physics' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ example: 'Head of Physics Department' })
  @IsString()
  @IsOptional()
  designation?: string;

  @ApiPropertyOptional({ example: 52000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  salary?: number;

  @ApiPropertyOptional({ example: 'ACTIVE', enum: ['ACTIVE', 'ON_LEAVE', 'TERMINATED'] })
  @IsIn(['ACTIVE', 'ON_LEAVE', 'TERMINATED'])
  @IsOptional()
  status?: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
}
