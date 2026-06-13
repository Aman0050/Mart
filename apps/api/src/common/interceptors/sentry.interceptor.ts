import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Do not log 400 or 401 as Sentry exceptions if preferred
        const status = error.getStatus ? error.getStatus() : 500;
        
        if (status >= 500) {
          Sentry.captureException(error, {
            tags: {
              context: context.getClass().name,
              handler: context.getHandler().name,
            },
          });
        }
        
        return throwError(() => error);
      }),
    );
  }
}
