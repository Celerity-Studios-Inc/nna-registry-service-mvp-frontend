// src/config/sentry.config.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class SentryService {
  private readonly logger = new Logger(SentryService.name);
  private static isInitialized = false;

  constructor(private configService: ConfigService) {
    if (!SentryService.isInitialized) {
      this.initializeSentry();
      SentryService.isInitialized = true;
    }
  }

  private initializeSentry(): void {
    try {
      const dsn = this.configService.get<string>('SENTRY_DSN');
      const environment = this.configService.get<string>('NODE_ENV') || 'development';
      
      // Log the configuration for debugging
      this.logger.log(`Initializing Sentry with DSN: ${dsn} in environment: ${environment}`);
      
      // Try to get version from package.json
      let release;
      try {
        const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
        release = packageJson.version;
      } catch (error) {
        this.logger.warn('Could not read package.json for release version');
        release = 'unknown';
      }

      // Initialize Sentry with proper configuration
      Sentry.init({
        dsn,
        environment,
        release,
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
        integrations: [
          nodeProfilingIntegration(),
        ],
        beforeSend(event) {
          // Add additional context or modify the event if needed
          return event;
        },
      });

      this.logger.log(`Sentry initialized successfully in ${environment} mode`);
    } catch (error) {
      this.logger.error('Failed to initialize Sentry:', error);
    }
  }

  captureException(exception: Error): void {
    try {
      Sentry.captureException(exception);
    } catch (error) {
      this.logger.error('Failed to capture exception in Sentry:', error);
    }
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    try {
      Sentry.captureMessage(message, level);
    } catch (error) {
      this.logger.error('Failed to capture message in Sentry:', error);
    }
  }

  setUser(user: { id: string; email: string; role: string }): void {
    try {
      Sentry.setUser(user);
    } catch (error) {
      this.logger.error('Failed to set user in Sentry:', error);
    }
  }

  addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
    try {
      Sentry.addBreadcrumb(breadcrumb);
    } catch (error) {
      this.logger.error('Failed to add breadcrumb in Sentry:', error);
    }
  }
}