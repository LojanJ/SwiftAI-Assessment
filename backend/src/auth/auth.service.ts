/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/users/user.services';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDTO: RegisterDTO) {
    const passwordHash = await bcrypt.hash(registerDTO.password, 10);
    const user = await this.userService.create({
      ...registerDTO,
      password: passwordHash,
    });

    const payload = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role };
    return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,    
          firstName: user.firstName,   
          lastName: user.lastName,
          role: user.role,
          createdAt: user.createdAt,
        },
    }
  }

  async login(loginDTO: LoginDTO){
    const user = await this.userService.findByEmail(loginDTO.email);
    if (!user) {    
      throw new Error('Invalid Credentials');
    }

    const validPassword = await bcrypt.compare(loginDTO.password, user.password);
    if (!validPassword) {
      throw new Error('Invalid Credentials');
    }

    const payload = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role };
    return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,    
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(user.password, password)){
        const { password, ...result } = user;
        return result
    }
    return null;
  }
}
