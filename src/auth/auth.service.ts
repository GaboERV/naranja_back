import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginUserDto, LoginWithPublicKeyDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  // Método de inicio de sesión con clave pública (encriptada con bcrypt)
  async loginWithPublicKey(loginWithPublicKeyDto: LoginWithPublicKeyDto) {
    const { email,clavePublica } = loginWithPublicKeyDto;

    // Buscar usuario por correo y verificar si tiene clave publica
    const user = await this.prisma.miembro.findFirst({
      where: {
        correo: email,
      },
    });
    // Verificar si el usuario existe
    if (!user) {
      throw new NotFoundException(
        'Usuario no encontrado'
      );
    }

    if (user.contrasena != clavePublica) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Retornar datos del usuario si la clave pública es correcta
    return {
      id: user.id,
      nombre: user.nombre,
      email: user.correo,
      // Puedes incluir otros campos que necesites
    };
  }

  // Método de inicio de sesión con correo y contraseña
  async login(loginUserDto: LoginUserDto) {
    const { email, contrasena } = loginUserDto;

    // Buscar usuario por correo
    const user = await this.prisma.empresa.findUnique({
      where: { email },
    });

    // Verificar si el usuario existe
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si las contraseñas son válidas
    if (!contrasena || !user.contrasena) {
      throw new UnauthorizedException('no hay datos');
    }

    const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Retornar datos del usuario si las credenciales son correctas
    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
    };
  }

  // Método de registro
  async registro(registerUserDto: RegisterUserDto) {
    const { email, contrasena, direccion, telefono, nombre, clavePublica } =
      registerUserDto;

    try {
      // Buscar si ya existe un usuario con este correo
      const existingUser = await this.prisma.empresa.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }

      // Encriptar la clave pública antes de guardarla
      //const hashedPublicKey = await bcrypt.hash(clavePublica, 10); //DO NOT HASH

      // Crear un usuario local con contraseña
      const hashedPassword = await bcrypt.hash(contrasena, 10);

      return await this.prisma.empresa.create({
        data: {
          nombre,
          email,
          direccion,
          telefono,
          contrasena: hashedPassword
        },
      });
    } catch (error) {
      // Manejar errores de Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already in use');
        }
      }

      // Relanzar cualquier otro error
      throw error;
    }
  }
}