import { SetMetadata } from '@nestjs/common';
import { ADMIN_KEY, Roles } from '../../../constants';

export const AdminAccess = () => SetMetadata(ADMIN_KEY, Roles.ADMIN);
