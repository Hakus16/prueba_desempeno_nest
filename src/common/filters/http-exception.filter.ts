import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

/**
 * Filtro de excepciones global.
 * Captura excepciones HTTP y errores de base de datos (como restricciones de unicidad o foráneas),
 * evitando respuestas 500 no controladas y formateando un esquema de error estándar.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Error interno en el servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj.message || resObj.error || exception.message;
      }
    } else if (typeof exception === 'object' && exception !== null) {
      const err = exception as Record<string, any>;

      // Manejo específico de errores de base de datos TypeORM / PostgreSQL
      if (err.code === '23505') {
        // Violación de restricción única
        status = HttpStatus.CONFLICT;
        message = err.detail
          ? `Registro duplicado: ${err.detail}`
          : 'Conflicto: ya existe un registro con esos datos únicos';
      } else if (err.code === '23503') {
        // Violación de llave foránea
        status = HttpStatus.BAD_REQUEST;
        message = err.detail
          ? `Referencia inválida: ${err.detail}`
          : 'Conflicto de clave foránea con un recurso relacionado';
      } else {
        this.logger.error(`Error no controlado capturado en ${request.url}:`, exception);
        message = err.message || 'Error interno no controlado';
      }
    }

    const errorPayload: ApiErrorResponse = {
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorPayload);
  }
}
