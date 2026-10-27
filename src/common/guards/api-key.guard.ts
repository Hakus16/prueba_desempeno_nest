import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Guard de autenticación mediante API Key para integraciones externas.
 * Valida el encabezado 'x-api-key' contra las claves configuradas en variables de entorno.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKeyHeader = request.headers['x-api-key'];

    if (!apiKeyHeader) {
      throw new UnauthorizedException('Encabezado x-api-key no proporcionado');
    }

    const rawKeys = this.configService.get<string>('API_KEYS', '');
    const validKeys = rawKeys
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const isValid = validKeys.includes(apiKeyHeader as string);
    if (!isValid) {
      throw new UnauthorizedException('API Key incorrecta o no autorizada');
    }

    return true;
  }
}
