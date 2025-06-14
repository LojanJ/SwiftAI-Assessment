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
import { UserRole } from 'src/users/entities/user.entity';
import { AppMailerService } from 'src/mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly mailer: AppMailerService,
  ) {}

  async register(registerDTO: RegisterDTO) {
    const passwordHash = await bcrypt.hash(registerDTO.password, 10);
    const user = await this.userService.create({
      ...registerDTO,
      password: passwordHash,
    });
    
    const payload = { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt};

    const message = {
      subject: 'Thanks for registering to BuddyBase!',
      text: `${payload.name} created a new account in BuddyBase`,
      html: `<p>You have successfully created a new account at BuddyBase</p>`,
    };

    await this.mailer.sendContactCreated(
      user.email,
      message.subject,
      message.text,
      message.html,
    );

    return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,    
          name: user.name,   
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

    const payload = { id: user.id, email: user.email, name: user.name, role: user.role };

    const message = {
      subject: 'New Login to your BuddyBase account',
      text: `Someone logged in your BuddyBase account at ${new Date().toLocaleDateString()}`,
      html: `<p>There has been a sign-in attempted to your account. Just clarifying things up.</p>`,
    };
    
    await this.mailer.sendContactCreated(
      user.email,
      message.subject,
      message.text,
      message.html,
    );

    return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,    
          name: user.name,
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
