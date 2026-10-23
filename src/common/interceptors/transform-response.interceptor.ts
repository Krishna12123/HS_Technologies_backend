import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const statusCode = response.statusCode;
    const requestId =
      (request.headers['x-request-id'] as string) || uuidv4();

    return next.handle().pipe(
      map((data) => {
        // Handle paginated responses or wrapped custom structures
        let responseData = data;
        let message = 'Request completed successfully';
        let paginationMeta = undefined;

        if (data && typeof data === 'object' && 'items' in data && 'total' in data) {
          responseData = data.items;
          paginationMeta = {
            page: Number(data.page) || 1,
            limit: Number(data.limit) || data.items.length,
            total: Number(data.total) || 0,
            totalPages: Number(data.totalPages) || 1,
          };
        }

        if (data && typeof data === 'object' && 'message' in data && 'data' in data) {
          message = data.message;
          responseData = data.data;
        }

        return {
          success: true,
          statusCode,
          message,
          data: responseData,
          meta: {
            requestId,
            timestamp: new Date().toISOString(),
            ...(paginationMeta && { pagination: paginationMeta }),
          },
        };
      }),
    );
  }
}
