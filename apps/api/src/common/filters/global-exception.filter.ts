import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException,
  HttpStatus, Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId = req.headers['x-request-id'] as string || uuidv4();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: unknown[] = [];

    // ── NestJS HTTP Exceptions ───────────────────
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string) || message;
        if (Array.isArray(resp.message)) {
          details = resp.message as unknown[];
          message = 'Validation failed';
        }
      }
      code = this.getErrorCode(status);
    }

    // ── Prisma Errors ────────────────────────────
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = `${(exception.meta?.target as string[])?.join(', ')} already exists`;
          code = 'DUPLICATE_RESOURCE';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Resource not found';
          code = 'RESOURCE_NOT_FOUND';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Related resource not found';
          code = 'INVALID_REFERENCE';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = 'Database operation failed';
          code = 'DATABASE_ERROR';
      }
    }

    // ── Unknown Errors ───────────────────────────
    else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled error [${requestId}]: ${exception.message}`,
        exception.stack,
      );
    }

    // Always log errors (non-4xx as errors, 4xx as warn)
    const logMethod = status >= 500 ? 'error' : 'warn';
    this.logger[logMethod](
      `${req.method} ${req.url} → ${status} [${requestId}]: ${message}`,
    );

    res.status(status).json({
      success: false,
      error: {
        code,
        message,
        ...(details.length > 0 && { details }),
        requestId,
      },
    });
  }

  private getErrorCode(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
    };
    return codes[status] || 'UNKNOWN_ERROR';
  }
}
