import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guard/roles.guard';
import { ValidRoles } from '../interfaces/valid-roles';
import { Roles } from './roles.decorator';
export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(Roles(...roles), UseGuards(AuthGuard(), RolesGuard));
}
