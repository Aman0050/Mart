import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';

export class PresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(image\/(jpeg|png|webp|gif))|(application\/pdf)$/, {
    message: 'File type must be an image (jpeg, png, webp, gif) or pdf',
  })
  fileType: string;

  @IsString()
  @IsOptional()
  folder?: string;
}

@ApiTags('upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'upload', version: '1' })
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('presigned-url')
  @ApiOperation({ summary: 'Generate a pre-signed URL for direct S3 upload' })
  async generatePresignedUrl(@Body() dto: PresignedUrlDto) {
    return this.uploadService.generatePresignedUrl(
      dto.fileName,
      dto.fileType,
      dto.folder,
    );
  }
}
