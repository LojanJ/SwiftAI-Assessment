import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { AppMailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [TypeOrmModule.forFeature([Contact]), AppMailerModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
