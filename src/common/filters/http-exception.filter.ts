import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message = 'Internal server error';
    let details: any = [];

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const respObj = exceptionResponse as Record<string, any>;
      message = respObj['message'] || exception['message'] || message;
      if (Array.isArray(respObj['message'])) {
        details = respObj['message'];
        message = 'Validation failed';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const requestId =
      (request.headers['x-request-id'] as string) || uuidv4();

    if (status >= 500) {
      this.logger.error(
        `[${requestId}] ${request.method} ${request.url} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `[${requestId}] ${request.method} ${request.url} - Status ${status} - ${message}`,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error: HttpStatus[status] || 'Error',
      message,
      details,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
