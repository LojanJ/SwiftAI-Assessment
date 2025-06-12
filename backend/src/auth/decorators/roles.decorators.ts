import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

export const KEY_ROLES = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(KEY_ROLES, roles);
