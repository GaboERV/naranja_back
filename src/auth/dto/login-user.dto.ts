import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
export class LoginUserDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  contrasena: string;
}

export class LoginWithPublicKeyDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  clavePublica: string;
}