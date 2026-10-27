import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMechanicDto {
  @ApiProperty({ example: 'Carlos Pérez', description: 'Nombre completo del mecánico' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiProperty({ example: 'carlos.perez@fleetcore.com', description: 'Correo electrónico' })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @ApiProperty({ example: 'Frenos y Suspensión', description: 'Especialidad técnica' })
  @IsString()
  @IsNotEmpty({ message: 'La especialidad es obligatoria' })
  specialty: string;

  @ApiPropertyOptional({ example: true, default: true, description: 'Estado activo o inactivo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 2, description: 'ID de usuario técnico vinculado' })
  @IsOptional()
  @IsInt()
  userId?: number;
}
