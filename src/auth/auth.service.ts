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
import { EmailService } from 'src/email/email.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // Método de inicio de sesión con clave pública (encriptada con bcrypt)
  async loginWithPublicKey(loginWithPublicKeyDto: LoginWithPublicKeyDto) {
    const { email, clavePublica } = loginWithPublicKeyDto;

    // Buscar usuario por correo y verificar si tiene clave publica
    const user = await this.prisma.miembro.findFirst({
      where: {
        correo: email,
      },
    });
    // Verificar si el usuario existe
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
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

  async registro(registerUserDto: RegisterUserDto) {
    const { email, contrasena, direccion, telefono, nombre } = registerUserDto;

    try {
      // Verificar si el correo ya está en uso
      const existingUser = await this.prisma.empresa.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('El correo ya está en uso');
      }

      // Verificar si ya hay un registro pendiente con este correo
      const existingPendingRegistration =
        await this.prisma.registroPendiente.findUnique({
          where: { email },
        });

      if (existingPendingRegistration) {
        throw new ConflictException(
          'Ya hay un registro pendiente con este correo',
        );
      }

      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(contrasena, 10);

      // Generar un token de verificación
      const verificationToken = uuidv4();

      // Guardar los datos en la tabla de registros pendientes
      const pendingUser = await this.prisma.registroPendiente.create({
        data: {
          nombre,
          email,
          direccion,
          telefono,
          contrasena: hashedPassword,
          verificationToken,
        },
      });

      // Enviar el correo de verificación
      await this.emailService.sendVerificationEmail(email, verificationToken);

      return {
        message:
          'Se ha enviado un correo de verificación. Por favor, verifica tu correo para completar el registro.',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('El correo ya está en uso');
        }
      }
      throw error;
    }
  }

  async verifyEmail(token: string) {
    // 1. Buscar el registro pendiente con el token
    let pendingUser;
    try {
      pendingUser = await this.prisma.registroPendiente.findFirst({
        where: { verificationToken: token },
      });
    } catch (error) {
      console.error('Error finding pending user:', error);
      throw new NotFoundException('Error trying to verify the token');
    }
  
    if (!pendingUser) {
      throw new NotFoundException('Token de verificación inválido.');
    }
  
    // 2. Verificar si ya existe una empresa con el mismo correo electrónico
    const existingEmpresa = await this.prisma.empresa.findUnique({
      where: { email: pendingUser.email },
    });
  
    if (existingEmpresa) {
      // Eliminar el registro pendiente antes de lanzar la excepción
      try {
        await this.prisma.registroPendiente.delete({
          where: { id: pendingUser.id },
        });
      } catch (error) {
        console.warn('Attempted to delete non-existent registroPendiente', pendingUser.id, error);
      }
      throw new ConflictException('Ya existe una empresa registrada con ese correo electrónico.');
    }
  
    // 3. Crear la empresa en la tabla principal
    try {
      const user = await this.prisma.empresa.create({
        data: {
          nombre: pendingUser.nombre,
          email: pendingUser.email,
          direccion: pendingUser.direccion,
          telefono: pendingUser.telefono,
          contrasena: pendingUser.contrasena,
          isVerified: true,
        },
      });
  
      // 4. Eliminar el registro pendiente después de crear la empresa
      await this.prisma.registroPendiente.delete({
        where: { id: pendingUser.id },
      });
  
      return {
        message: 'Correo electrónico verificado con éxito. Tu cuenta ha sido creada.',
        user,
      };
    } catch (error) {
      console.error('Error creating empresa:', error);
  
      // Eliminar el registro pendiente en caso de error
      try {
        await this.prisma.registroPendiente.delete({
          where: { id: pendingUser.id },
        });
      } catch (error) {
        console.warn('Attempted to delete non-existent registroPendiente', pendingUser.id, error);
      }
  
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe una empresa registrada con ese correo electrónico.');
      }
      throw new Error('Error creating empresa, please try again later');
    }
  }

}
