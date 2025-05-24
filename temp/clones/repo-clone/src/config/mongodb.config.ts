// src/config/mongodb.config.ts
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

export const mongooseConfig = (configService: ConfigService): MongooseModuleOptions => {
  const uri = configService.get<string>('MONGODB_URI');
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  return {
    uri: uri.replace(/\r?\n|\r/g, ''),
  };
};