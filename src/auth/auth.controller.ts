import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto} from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
  @Post('registro')
  create(@Body() RegisterUserDto: RegisterUserDto) {
    return this.authService.registro(RegisterUserDto);
  }
}
