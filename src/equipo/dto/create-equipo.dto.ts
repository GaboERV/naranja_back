import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
export class CreateEquipoDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  nombre: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  funcion?: string;

  @IsOptional()
  @IsInt()
  @ApiProperty()
  proyectoId?: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  empresaId: number;
}
