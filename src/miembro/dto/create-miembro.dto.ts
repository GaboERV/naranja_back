import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMiembroDto {
  @ApiProperty({ description: 'Nombre del miembro' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ description: 'Especialidad del miembro', required: false })
  @IsOptional()
  @IsString()
  especialidad?: string;

  @ApiProperty({ description: 'Carga de trabajo del miembro', required: false })
  @IsOptional()
  @IsNumber()
  cargaTrabajo?: number;

  @ApiProperty({ description: 'ID del equipo al que pertenece el miembro' })
  @IsNotEmpty()
  @IsNumber()
  equipoId: number;

  @ApiProperty({ description: 'Correo electrónico del miembro' })
  @IsNotEmpty()
  @IsEmail()
  correo: string;

  @ApiProperty({ description: 'Contraseña del miembro' })
  @IsNotEmpty()
  @IsString()
  contrasena: string;
}