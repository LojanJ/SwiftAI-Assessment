import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() RegisterDTo: RegisterDTO) {
    return await this.authService.register(RegisterDTo);
  }

  @Post('login')
  async login(@Body() loginDTO: LoginDTO) {
    console.log(loginDTO);
    return await this.authService.login(loginDTO);
  }
}
