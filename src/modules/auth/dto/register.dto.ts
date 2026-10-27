import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/constants/roles.enum';

export class RegisterDto {
  @ApiProperty({ example: 'admin@fleetcore.com', description: 'Correo electrónico del usuario' })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'Contraseña del usuario (mínimo 6 caracteres)' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({ enum: Role, example: Role.TECHNICIAN, description: 'Rol asignado al usuario' })
  @IsEnum(Role, { message: 'El rol debe ser ADMIN o TECHNICIAN' })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  role: Role;
}
