import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles';
export const ROLES_KEY = 'roles';

export const Roles = (...args: ValidRoles[]) => SetMetadata(ROLES_KEY, args);
