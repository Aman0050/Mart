import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '9876543210', description: 'Phone number or email' })
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'StrongPass@123' })
  @IsString()
  @MinLength(1)
  password: string;
}
