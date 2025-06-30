// src/modules/storage/storage.service.ts
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { Storage } from '@google-cloud/storage';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucket: string;
  private isDevelopment: boolean;
  private localStoragePath: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    if (!nodeEnv) {
      throw new Error('NODE_ENV is not defined in environment variables');
    }
    this.isDevelopment = nodeEnv !== 'production';
    this.logger.log(
      `Initializing storage service in ${this.isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'} mode`,
    );

    if (this.isDevelopment) {
      // In development, use local file storage
      this.localStoragePath = path.join(process.cwd(), 'storage');

      // Create the storage directory if it doesn't exist
      if (!fs.existsSync(this.localStoragePath)) {
        fs.mkdirSync(this.localStoragePath, { recursive: true });
      }

      this.logger.log(`Using local storage at: ${this.localStoragePath}`);
    } else {
      // In production, use GCP Storage
      const projectId = this.configService.get<string>('GCP_PROJECT_ID');
      if (!projectId) {
        throw new Error('GCP_PROJECT_ID is missing in environment variables.');
      }

      this.storage = new Storage({ projectId });

      const bucketName = this.configService.get<string>('GCP_BUCKET_NAME');
      if (!bucketName) {
        throw new Error(
          'GCP_BUCKET_NAME is not defined in environment variables',
        );
      }
      this.bucket = bucketName;

      this.logger.log(`Using GCP Storage with bucket: ${this.bucket}`);
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    mimeType: string,
    filename: string,
    layer: string,
    category: string,
    subcategory: string,
  ): Promise<string> {
    const filePath = `${layer}/${category}/${subcategory}/${filename}`;

    if (this.isDevelopment) {
      // In development, save to local file system
      try {
        const dirPath = path.join(
          this.localStoragePath,
          layer,
          category,
          subcategory,
        );

        // Create directories if they don't exist
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }

        const fullPath = path.join(dirPath, filename);
        fs.writeFileSync(fullPath, fileBuffer);

        // Return a file:// URL that points to the local file
        return `file://${fullPath}`;
      } catch (error: any) {
        throw new HttpException(
          `Failed to save file locally: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    // In production, use GCP Storage
    try {
      const bucketRef = this.storage.bucket(this.bucket);
      const file = bucketRef.file(filePath);

      const stream = file.createWriteStream({
        metadata: { contentType: mimeType },
        resumable: false,
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (error: any) => {
          reject(
            new HttpException(
              `Failed to upload file: ${error.message}`,
              HttpStatus.BAD_GATEWAY,
            ),
          );
        });

        stream.on('finish', () => {
          file
            .makePublic()
            .then(() => {
              resolve(
                `https://storage.googleapis.com/${this.bucket}/${filePath}`,
              );
            })
            .catch((error: any) => {
              reject(
                new HttpException(
                  `Failed to make file public: ${error.message}`,
                  HttpStatus.BAD_GATEWAY,
                ),
              );
            });
        });

        const readable = new Readable();
        readable._read = () => {};
        readable.push(fileBuffer);
        readable.push(null);
        readable.pipe(stream);
      });
    } catch (error: any) {
      throw new HttpException(
        `Failed to upload file to GCP Bucket: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (this.isDevelopment) {
      // In development, delete local file
      try {
        if (fileUrl.startsWith('file://')) {
          const filePath = fileUrl.substring(7); // Remove 'file://' prefix
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          } else {
            throw new Error(`File does not exist: ${filePath}`);
          }
        } else {
          throw new Error('Invalid file URL format');
        }
      } catch (error: any) {
        throw new HttpException(
          `Failed to delete file: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } else {
      // In production, use GCP Storage
      try {
        const bucketUrlPrefix = `https://storage.googleapis.com/${this.bucket}/`;
        if (!fileUrl.startsWith(bucketUrlPrefix)) {
          throw new HttpException(
            'Invalid file URL format',
            HttpStatus.BAD_REQUEST,
          );
        }

        const filePath = fileUrl.substring(bucketUrlPrefix.length);
        await this.storage.bucket(this.bucket).file(filePath).delete();
      } catch (error: any) {
        throw new HttpException(
          `Failed to delete file: ${error.message}`,
          HttpStatus.BAD_GATEWAY,
        );
      }
    }
  }
}
