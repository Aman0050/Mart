import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already has success field, pass through (auth responses etc.)
        if (data && typeof data === 'object' && 'success' in data) return data;

        // If paginated response (has data + meta)
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return { success: true, data: data.data, meta: data.meta };
        }

        return { success: true, data };
      }),
    );
  }
}
