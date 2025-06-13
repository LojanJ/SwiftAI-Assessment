import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from 'src/contact/entities/contact.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
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
    return this.userRepository.delete(id);
  }

  async deleteContact(id: string) {
    return this.contactRepository.delete(id);
  }
}
