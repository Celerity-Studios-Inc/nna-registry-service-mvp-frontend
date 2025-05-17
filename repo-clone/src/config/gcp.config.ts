// src/config/gcp.config.ts
import { ConfigService } from '@nestjs/config';
import { StorageOptions } from '@google-cloud/storage';

export const gcpConfig = (configService: ConfigService): StorageOptions => ({
  projectId: configService.get<string>('GCP_PROJECT_ID'),
  keyFilename: configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS'),
});