import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkshopDto {
  @ApiProperty({ example: 'Taller Central Norte', description: 'Nombre comercial del taller' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del taller es obligatorio' })
  name: string;

  @ApiProperty({ example: 'Calle 100 # 15-20, Bogotá', description: 'Dirección física del taller' })
  @IsString()
  @IsNotEmpty({ message: 'La dirección del taller es obligatoria' })
  address: string;

  @ApiPropertyOptional({ example: true, default: true, description: 'Estado activo o inactivo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
