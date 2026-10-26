import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error';
import { AuthUser, UserRole } from '../interfaces/auth-context.interface';
import { env } from '../../config/env';

// In-memory token-to-user mapping or test header extraction
export const DEFAULT_DEV_USER: AuthUser = {
  id: 'usr-admin-01',
  email: 'admin@schoolerp.edu',
  name: 'System Administrator',
  role: 'ADMIN',
  schoolId: env.DEFAULT_SCHOOL_ID,
  permissions: ['*']
};

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  // 1. Check for test / gateway injected context headers
  const headerUserId = req.headers['x-user-id'] as string;
  const headerUserRole = req.headers['x-user-role'] as UserRole;
  const headerSchoolId = req.headers['x-school-id'] as string;
  const authHeader = req.headers['authorization'];

  if (headerUserId || headerUserRole) {
    const resolvedId = headerUserId || (headerUserRole === 'ADMIN' ? 'usr-admin-01' : 'usr-test-01');
    req.user = {
      id: resolvedId,
      email: (req.headers['x-user-email'] as string) || `${resolvedId}@schoolerp.edu`,
      name: (req.headers['x-user-name'] as string) || 'Authenticated User',
      role: headerUserRole || 'ADMIN',
      schoolId: headerSchoolId || env.DEFAULT_SCHOOL_ID
    };
    return next();
  }

  // 2. Check Authorization Bearer header
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    // In production without external IdP, tokens can be verified with JWT or session service.
    // Here we support standard JWT simulation / token check:
    if (token === 'admin-token') {
      req.user = DEFAULT_DEV_USER;
      return next();
    } else if (token === 'teacher-token') {
      req.user = {
        id: 'usr-teacher-01',
        email: 'teacher@schoolerp.edu',
        name: 'Sarah Jenkins',
        role: 'TEACHER',
        schoolId: env.DEFAULT_SCHOOL_ID
      };
      return next();
    } else if (token === 'student-token') {
      req.user = {
        id: 'usr-student-01',
        email: 'student@schoolerp.edu',
        name: 'Alex Johnson',
        role: 'STUDENT',
        schoolId: env.DEFAULT_SCHOOL_ID
      };
      return next();
    } else if (token.startsWith('user:')) {
      // Format: user:id:role:schoolId
      const parts = token.split(':');
      req.user = {
        id: parts[1] || 'usr-custom',
        email: `${parts[1] || 'user'}@schoolerp.edu`,
        name: 'Token User',
        role: (parts[2] as UserRole) || 'TEACHER',
        schoolId: parts[3] || env.DEFAULT_SCHOOL_ID
      };
      return next();
    }
  }

  // If explicitly simulating unauthenticated requests in tests, allow header x-anonymous: true
  if (req.headers['x-anonymous'] === 'true') {
    req.user = undefined;
    return next();
  }

  // Default fallback user when no token/header is provided
  req.user = DEFAULT_DEV_USER;

  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication token or credentials required'));
  }
  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Role '${req.user.role}' lacks permission for this resource.`
        )
      );
    }
    next();
  };
}
