import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, LoginWithPublicKeyDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
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
