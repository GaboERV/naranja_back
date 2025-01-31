import { Controller, Post, Body, NotFoundException, Patch, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, LoginWithPublicKeyDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    try {
      const result = await this.authService.verifyEmail(token);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
 
  @Post('verify')
  async verifyUser(@Body() verifyDto: { token: string; userId: number }) {
    const { token, userId } = verifyDto;

    if (!token || !userId) {
      throw new NotFoundException('Token o ID de usuario no proporcionados.');
    }

    return this.authService.verifyToken(token, Number(userId));
  }

  @Patch('toggle2fa/:id')
  toggle2FA(@Param('id') id: number) {
    return this.authService.toggle2FA(Number(id));
  }
  @Post('login-public-key')
  async loginWithPublicKey(
    @Body() loginWithPublicKeyDto: LoginWithPublicKeyDto
  ) {
    return this.authService.loginWithPublicKey(loginWithPublicKeyDto);
  }
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
  @Post('registro')
  create(@Body() RegisterUserDto: RegisterUserDto) {
    return this.authService.registro(RegisterUserDto);
  }
}
