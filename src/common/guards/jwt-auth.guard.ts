import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../modules/users/services/users.service';

/**
 * Guard de autenticación JWT nativo de NestJS (sin Passport ni Strategy).
 * Extrae el Bearer token del header Authorization, valida su firma,
 * verifica que no haya expirado y comprueba que el usuario exista y esté activo en la BD.
 * Si el endpoint o controlador tiene el decorador @Public(), permite el acceso libre.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No autorizado: token no proporcionado');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('No autorizado: formato de token inválido');
    }

    let payload: JwtPayload;
    try {
      const secret = this.configService.get<string>('JWT_SECRET', 'secretKey123');
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, { secret });
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('El token de autenticación ha expirado');
      }
      throw new UnauthorizedException('No autorizado: token inválido o no proporcionado');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('El usuario no existe o se encuentra inactivo');
    }

    // Inyecta el usuario validado en la petición para @CurrentUser() y RolesGuard
    request.user = user;
    return true;
  }
}
