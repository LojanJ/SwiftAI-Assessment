/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { LoginDTO } from '../dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(loginDTO: LoginDTO) {
    const user = await this.authService.validateUser(
      loginDTO.email,
      loginDTO.password,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
