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
import * as crypto from 'crypto';

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
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex'); // Token de 64 caracteres
  }
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
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Verificar si la autenticación de dos pasos está habilitada
    if (user.Enable2FA) {
      // Si 2FA está habilitado, generar el token y enviar el enlace de verificación
      const token = this.generateToken();

      // Guardar el token en la base de datos
      await this.prisma.empresa.update({
        where: { id: user.id },
        data: { verificationToken: token },
      });

      // Crear el enlace de verificación con la ID como parámetro
      const verificationLink = `http://localhost:5173/Verify?token=${token}&id=${user.id}`;

      // Enviar el enlace por correo electrónico
      await this.emailService.sendVerificationLink(
        user.email,
        verificationLink,
      );

      return {
        message:
          'Se ha enviado un enlace de verificación a tu correo electrónico.',
      };
    } else {
      // Si 2FA está deshabilitado, solo devolver el mensaje y el token
      const token = this.generateToken();
      await this.prisma.empresa.update({
        where: { id: user.id },
        data: { verificationToken: token },
      });
      return {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        Enable2FA: user.Enable2FA,
      };
    }
  }

  // Modificación del servicio de correo
  async registro(registerUserDto: RegisterUserDto) {
    const { email, contrasena, direccion, telefono, nombre } = registerUserDto;

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

    try {
      // Guardar los datos en la tabla de registros pendientes
      await this.prisma.registroPendiente.create({
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
      // Si ocurre un error, eliminar el registro pendiente para evitar datos inconsistentes
      await this.prisma.registroPendiente.delete({
        where: { email },
      });

      throw new Error(
        'Error al registrar el usuario. Por favor, inténtalo de nuevo.',
      );
    }
  }
  async verifyToken(token: string, userId: number) {
    // Buscar el usuario por el token de verificación y la ID
    const user = await this.prisma.empresa.findFirst({
      where: { id: userId, verificationToken: token },
    });

    if (!user) {
      throw new NotFoundException(
        'Token de verificación inválido o usuario no encontrado.',
      );
    }

    // Eliminar el token después de la verificación y marcar el usuario como verificado
    await this.prisma.empresa.update({
      where: { id: user.id },
      data: { verificationToken: null, isVerified: true },
    });

    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      Enable2FA: user.Enable2FA,
    };
  }
  async getUser(id: number) {
    return this.prisma.empresa.findFirst({
      where: {
        id: id,
      },
    });
  }
  async toggle2FA(id: number) {
    const user = await this.prisma.empresa.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updatedUser = await this.prisma.empresa.update({
      where: { id },
      data: { Enable2FA: !user.Enable2FA },
    });

    return { Enable2FA: updatedUser.Enable2FA };
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

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Check if the pending registration still exists within the transaction
        const currentPendingUser = await tx.registroPendiente.findUnique({
          where: { id: pendingUser.id },
        });

        if (!currentPendingUser) {
          // If the pending user is not present, it means that another request processed this email.
          // We return null, and abort the transaction.
          return null;
        }

        const createdEmpresa = await tx.empresa.upsert({
          where: { email: pendingUser.email },
          update: { isVerified: true },
          create: {
            nombre: pendingUser.nombre,
            email: pendingUser.email,
            direccion: pendingUser.direccion,
            telefono: pendingUser.telefono,
            contrasena: pendingUser.contrasena,
            isVerified: true,
          },
        });

        await tx.registroPendiente.delete({
          where: { id: pendingUser.id },
        });

        return {
          message:
            'Correo electrónico verificado con éxito. Tu cuenta ha sido creada.',
          user: createdEmpresa,
        };
      });
    } catch (error) {
      console.error(
        'Error creating empresa or deleting pending registro:',
        error,
      );

      if (error.code === 'P2002') {
        //If error is related to the unique constraint on the email we return a conflict message.
        throw new ConflictException(
          'Ya existe una empresa registrada con ese correo electrónico.',
        );
      }

      throw new Error('Error creating empresa, please try again later');
    }
  }
}
