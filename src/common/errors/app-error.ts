import { ErrorCode } from './error-codes';

export interface ErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode | string;
  public readonly details: ErrorDetail[];
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    code: ErrorCode | string,
    message: string,
    details: ErrorDetail[] = [],
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Invalid request payload or parameters', code: ErrorCode | string = ErrorCode.VALIDATION_ERROR, details: ErrorDetail[] = []) {
    super(400, code, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', code: ErrorCode | string = ErrorCode.UNAUTHORIZED, details: ErrorDetail[] = []) {
    super(401, code, message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions to perform this operation', code: ErrorCode | string = ErrorCode.FORBIDDEN, details: ErrorDetail[] = []) {
    super(403, code, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code: ErrorCode | string = ErrorCode.NOT_FOUND, details: ErrorDetail[] = []) {
    super(404, code, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict detected', code: ErrorCode | string = ErrorCode.CONFLICT, details: ErrorDetail[] = []) {
    super(409, code, message, details);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = 'Business validation failed', code: ErrorCode | string = ErrorCode.UNPROCESSABLE_ENTITY, details: ErrorDetail[] = []) {
    super(422, code, message, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error occurred', code: ErrorCode | string = ErrorCode.INTERNAL_SERVER_ERROR, details: ErrorDetail[] = []) {
    super(500, code, message, details, false);
  }
}
