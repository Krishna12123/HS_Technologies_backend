import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ErrorDetail } from '../errors/app-error';
import { ErrorCode } from '../errors/error-codes';
import { sendError } from '../utils/response.util';

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId;

  // Handle known operational AppError
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode, err.details, requestId);
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details: ErrorDetail[] = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code
    }));
    sendError(
      res,
      ErrorCode.VALIDATION_ERROR,
      'Request validation failed',
      400,
      details,
      requestId
    );
    return;
  }

  // Handle JSON parse errors from body-parser
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    sendError(
      res,
      ErrorCode.VALIDATION_ERROR,
      'Malformed JSON payload in request body',
      400,
      [{ message: err.message }],
      requestId
    );
    return;
  }

  // Unhandled / Unexpected Server Error
  console.error('[Unhandled Server Error]:', err);
  sendError(
    res,
    ErrorCode.INTERNAL_SERVER_ERROR,
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'An unexpected error occurred',
    500,
    [],
    requestId
  );
}
