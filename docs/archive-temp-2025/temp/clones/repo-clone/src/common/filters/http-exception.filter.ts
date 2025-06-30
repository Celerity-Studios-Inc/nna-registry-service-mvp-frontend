// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { SentryService } from '../../config/sentry.config';
import { SentryExceptionCaptured } from '@sentry/nestjs';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private sentryService: SentryService) {}

  @SentryExceptionCaptured()
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    this.sentryService.captureException(exception);

    response.status(status).json({
      success: false,
      error: {
        code: exception.name,
        message: exception.message,
        details: exceptionResponse,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}