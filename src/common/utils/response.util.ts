import { Response } from 'express';
import { ErrorDetail } from '../errors/app-error';

export interface ApiResponseMeta {
  requestId?: string;
  timestamp?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  [key: string]: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: ApiResponseMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details: ErrorDetail[];
    requestId?: string;
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  messageOrMeta?: string | Partial<ApiResponseMeta>,
  meta?: Partial<ApiResponseMeta>
): Response {
  let message = 'Operation completed successfully';
  let resolvedMeta = meta;

  if (typeof messageOrMeta === 'string') {
    message = messageOrMeta;
  } else if (typeof messageOrMeta === 'object' && messageOrMeta !== null) {
    resolvedMeta = messageOrMeta;
  }

  const requestId = (res.req as any)?.requestId || resolvedMeta?.requestId;
  const responseBody: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
    ...(resolvedMeta || requestId ? { meta: { requestId, ...resolvedMeta } } : {})
  };
  return res.status(statusCode).json(responseBody);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode = 500,
  details: ErrorDetail[] = [],
  requestId?: string
): Response {
  const resolvedReqId = requestId || (res.req as any)?.requestId;
  const responseBody: ApiErrorResponse = {
    success: false,
    message,
    error: {
      code,
      details,
      ...(resolvedReqId ? { requestId: resolvedReqId } : {})
    }
  };
  return res.status(statusCode).json(responseBody);
}
