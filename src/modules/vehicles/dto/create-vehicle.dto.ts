import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Matches, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleStatus } from '../../../common/constants/vehicle-status.enum';

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABC123', description: 'Placa única del vehículo' })
  @IsString({ message: 'La placa debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La placa es obligatoria' })
  @Matches(/^[A-Z0-9-]{5,10}$/i, { message: 'Formato de placa inválido' })
  plate: string;

  @ApiProperty({ example: 'Chevrolet', description: 'Marca del vehículo' })
  @IsString()
  @IsNotEmpty({ message: 'La marca es obligatoria' })
  brand: string;

  @ApiProperty({ example: 'NPR', description: 'Modelo o línea del vehículo' })
  @IsString()
  @IsNotEmpty({ message: 'El modelo es obligatorio' })
  model: string;

  @ApiProperty({ example: 2022, description: 'Año de fabricación' })
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(1950, { message: 'El año debe ser mayor a 1950' })
  @Max(new Date().getFullYear() + 1, { message: 'El año no puede ser en el futuro lejano' })
  year: number;

  @ApiProperty({ example: 45000, description: 'Kilometraje actual' })
  @IsInt({ message: 'El kilometraje debe ser un número entero' })
  @Min(0, { message: 'El kilometraje no puede ser negativo' })
  mileage: number;

  @ApiPropertyOptional({ enum: VehicleStatus, default: VehicleStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(VehicleStatus, { message: 'El estado debe ser AVAILABLE, IN_MAINTENANCE o INACTIVE' })
  status?: VehicleStatus;
}
