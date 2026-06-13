import { IsString, IsEmail, IsOptional, MinLength, IsMobilePhone, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ example: 'rahul@acmeindustries.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'StrongPass@123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ enum: ['buyer', 'seller'] })
  @IsEnum(['buyer', 'seller'])
  @IsOptional()
  role?: 'buyer' | 'seller';
}
