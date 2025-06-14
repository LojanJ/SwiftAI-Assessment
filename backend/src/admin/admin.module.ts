import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from 'src/contact/entities/contact.entity';
import { User } from 'src/users/entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.services';
import { AppMailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Contact]), AppMailerModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
