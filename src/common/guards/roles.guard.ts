import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const authUser = user as AuthenticatedUser;

    if (!authUser || !authUser.role) {
      throw new ForbiddenException('Access denied: User has no valid role assigned.');
    }

    // SUPER_ADMIN has platform-wide full access
    if (authUser.role === 'SUPER_ADMIN') {
      return true;
    }

    const hasRole = requiredRoles.includes(authUser.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: Required roles [${requiredRoles.join(', ')}]. Your role: ${authUser.role}`,
      );
    }

    return true;
  }
}
