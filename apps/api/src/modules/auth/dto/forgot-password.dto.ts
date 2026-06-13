import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: '9876543210', description: 'Phone or email' })
  @IsString()
  identifier: string;
}
