import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from 'src/contact/entities/contact.entity';
import { AppMailerService } from 'src/mailer/mailer.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    private readonly mailer: AppMailerService,
  ) {}

  async getAllContacts(): Promise<Contact[]> {
    return this.contactRepository.find({
      relations: ['user'],
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'name', 'email', 'role', 'createdAt'],
      relations: ['contacts'],
    });
  }

  async deleteUser(id: string) {
    const deletedAccount = await this.userRepository.findOne({
      where: { id: id },
    });

    await this.userRepository.delete(id);
    const message = {
      subject: 'Your account has been revoked by the admin',
      text: `${deletedAccount?.name || 'Your'} account has been revoked by the admin.`,
      html: `<p>Your account has been revoked by the admin at BuddyBase. 
      Please reach out to admin@example.com for further clarification</p>`,
    };

    if (deletedAccount && deletedAccount.email) {
      await this.mailer.sendContactCreated(
        deletedAccount.email,
        message.subject,
        message.text,
        message.html,
      );
    }
  }

  async deleteContact(id: string) {
    return this.contactRepository.delete(id);
  }
}
