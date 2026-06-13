import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler, Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = req;
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
    const userId = (req.user as { sub?: string })?.sub || 'anonymous';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const duration = Date.now() - startTime;
          this.logger.log(
            `${method} ${url} ${res.statusCode} ${duration}ms [${requestId}] user=${userId} ip=${ip}`,
          );
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `${method} ${url} ERROR ${duration}ms [${requestId}] user=${userId}: ${err.message}`,
          );
        },
      }),
    );
  }
}
