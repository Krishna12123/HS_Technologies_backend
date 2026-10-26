export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'EXAM_OFFICER' | 'STUDENT' | 'PARENT';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  schoolId: string;
  permissions?: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      requestId?: string;
    }
  }
}
