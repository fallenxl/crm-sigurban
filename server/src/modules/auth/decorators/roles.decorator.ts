import { SetMetadata } from '@nestjs/common';
import { Roles as RolesUser, ROLES_KEY } from '../../../constants';

export const Roles = (...roles: Array<keyof typeof RolesUser>) =>
  SetMetadata(ROLES_KEY, roles);
