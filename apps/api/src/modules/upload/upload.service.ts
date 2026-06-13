import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly logger = new Logger(UploadService.name);
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('app.aws.s3Bucket') || 'nexmarto-uploads';
    
    this.s3Client = new S3Client({
      region: this.configService.get<string>('app.aws.region') || 'ap-south-1',
      credentials: {
        accessKeyId: this.configService.get<string>('app.aws.accessKeyId') || 'mock-key',
        secretAccessKey: this.configService.get<string>('app.aws.secretAccessKey') || 'mock-secret',
      },
    });
  }

  async generatePresignedUrl(fileName: string, fileType: string, folder: string = 'misc') {
    try {
      const extension = fileName.split('.').pop();
      const uniqueFileName = `${folder}/${uuidv4()}.${extension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: uniqueFileName,
        ContentType: fileType,
        // Optional: Set ACL if your bucket allows it, else remove
        // ACL: 'public-read', 
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600, // URL valid for 1 hour
      });

      const s3Url = this.configService.get<string>('app.aws.s3Url') || `https://${this.bucket}.s3.amazonaws.com`;

      return {
        presignedUrl,
        fileUrl: `${s3Url}/${uniqueFileName}`,
        key: uniqueFileName,
      };
    } catch (error) {
      this.logger.error(`Failed to generate pre-signed URL: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Could not generate upload URL');
    }
  }
}
