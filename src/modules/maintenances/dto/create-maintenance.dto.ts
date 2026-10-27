import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaintenanceType } from '../../../common/constants/maintenance-type.enum';

export class CreateMaintenanceDto {
  @ApiProperty({ enum: MaintenanceType, example: MaintenanceType.PREVENTIVE })
  @IsEnum(MaintenanceType, { message: 'El tipo debe ser PREVENTIVE o CORRECTIVE' })
  @IsNotEmpty({ message: 'El tipo de mantenimiento es obligatorio' })
  type: MaintenanceType;

  @ApiProperty({ example: 'Cambio de aceite, filtros y revisión de frenos' })
  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  description: string;

  @ApiProperty({ example: 45000, description: 'Kilometraje actual del vehículo al ingresar' })
  @IsInt({ message: 'El kilometraje debe ser un número entero' })
  @Min(0, { message: 'El kilometraje no puede ser negativo' })
  initialMileage: number;

  @ApiProperty({ example: '2026-10-28T08:00:00.000Z', description: 'Fecha y hora programada de inicio' })
  @IsDateString({}, { message: 'La fecha programada debe ser una fecha ISO válida' })
  @IsNotEmpty({ message: 'La fecha programada es obligatoria' })
  scheduledDate: string;

  @ApiPropertyOptional({ example: '2026-10-28T10:00:00.000Z', description: 'Fecha y hora estimada de finalización (opcional, por defecto 2h después)' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha estimada de finalización debe ser una fecha ISO válida' })
  estimatedEndDate?: string;

  @ApiProperty({ example: 1, description: 'ID del vehículo' })
  @IsInt({ message: 'El ID del vehículo debe ser un número entero' })
  @IsPositive({ message: 'El ID del vehículo debe ser positivo' })
  vehicleId: number;

  @ApiProperty({ example: 1, description: 'ID del mecánico' })
  @IsInt({ message: 'El ID del mecánico debe ser un número entero' })
  @IsPositive({ message: 'El ID del mecánico debe ser positivo' })
  mechanicId: number;

  @ApiProperty({ example: 1, description: 'ID del taller' })
  @IsInt({ message: 'El ID del taller debe ser un número entero' })
  @IsPositive({ message: 'El ID del taller debe ser positivo' })
  workshopId: number;
}
