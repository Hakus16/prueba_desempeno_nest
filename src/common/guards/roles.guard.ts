import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../constants/roles.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard de autorización basada en roles.
 * Valida que el usuario autenticado posea al menos uno de los roles
 * especificados con el decorador @Roles().
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('Acceso restringido: no se pudo verificar el rol del usuario');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(`Acceso restringido: se requiere uno de los siguientes roles: [${requiredRoles.join(', ')}]`);
    }

    return true;
  }
}
