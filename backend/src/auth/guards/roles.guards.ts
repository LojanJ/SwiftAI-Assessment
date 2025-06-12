/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/users/entities/user.entity';
import { KEY_ROLES } from '../decorators/roles.decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // Validates whether current user's role is accessible
  canActivate(context: ExecutionContext): boolean {
    const rolesRequired = this.reflector.getAllAndOverride<UserRole[]>(
      KEY_ROLES,
      [context.getHandler(), context.getClass()],
    );

    if (!rolesRequired) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return rolesRequired.some((role) => user.role?.includes(role));
  }
}
