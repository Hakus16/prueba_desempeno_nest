import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaintenanceStatus } from '../../../common/constants/maintenance-status.enum';

export class UpdateMaintenanceStatusDto {
  @ApiProperty({
    enum: MaintenanceStatus,
    example: MaintenanceStatus.IN_PROGRESS,
    description: 'Nuevo estado del mantenimiento (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)',
  })
  @IsEnum(MaintenanceStatus, { message: 'Estado inválido' })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  status: MaintenanceStatus;

  // Campos opcionales en el DTO, pero requeridos si el status es COMPLETED
  @ApiPropertyOptional({ example: 'Se realizó cambio de aceite sintético 5W-30 y pastillas de freno' })
  @IsOptional()
  @IsString()
  workDone?: string;

  @ApiPropertyOptional({ example: 350000.5, description: 'Costo final del servicio' })
  @IsOptional()
  @IsNumber({}, { message: 'El costo final debe ser un valor numérico' })
  @Min(0, { message: 'El costo no puede ser negativo' })
  finalCost?: number;

  @ApiPropertyOptional({ example: '2026-10-28T12:00:00.000Z', description: 'Fecha de finalización' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de finalización debe tener formato ISO válido' })
  completedAt?: string;

  @ApiPropertyOptional({ example: 45050, description: 'Kilometraje registrado al finalizar' })
  @IsOptional()
  @IsInt({ message: 'El kilometraje final debe ser un entero' })
  @Min(0, { message: 'El kilometraje final no puede ser negativo' })
  finalMileage?: number;
}
