import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.get(ROLES_KEY, context.getHandler());

    if (!requiredRoles) return true;

    if (requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();

    const user = req.user;

    if (!user)
      throw new BadRequestException('Usuario no encontrado en la solicitud');

    if (requiredRoles.includes(user.rol)) return true;

    throw new ForbiddenException(
      `El usuario no tiene los roles requeridos ${requiredRoles}, el usuario tiene el rol ${user.rol}`,
    );
  }
}
