/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Contact } from './entities/contact.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactDTO } from 'src/auth/dto/create-contact.dto';
import { User } from 'src/users/entities/user.entity';
import { UpdateContactDTO } from './dto/update-contact.dto';
import { Parser } from 'json2csv';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async create(
    createContactDTO: CreateContactDTO,
    user: User,
  ): Promise<Contact> {
    const contact = this.contactRepository.create({
      ...createContactDTO,
      userId: user.id,
    });
    return this.contactRepository.save(contact);
  }

  // Method to find contacts with pagination, search and sorting
  async findAll(
    user: User,
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    try {
      const queryBuilder = this.contactRepository
        .createQueryBuilder('contact')
        .where('contact.userId = :userId', { userId: user.id });

      if (search) {
        queryBuilder.andWhere(
          '(contact.name ILIKE :search OR contact.email ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      // Get total count before pagination
      const total = await queryBuilder.getCount();

      queryBuilder
        .orderBy(`contact.${sortBy}`, sortOrder)
        .skip((page - 1) * limit)
        .take(limit);

      const contacts = await queryBuilder.getMany();

      return {
        data: contacts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error in findAll contacts:', error);
      throw error;
    }
  }

  async findOne(id: string, user: User): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id: id.toString(), userId: user.id },
    });

    if (!contact) {
      throw new NotFoundException('Contact not located');
    }
    return contact;
  }

  async update(id: string, updateContactDTO: UpdateContactDTO, user: User) {
    const contact = await this.findOne(id, user);
    if (!contact) {
      throw new NotFoundException('Contact not located');
    }
    const updatedContact = Object.assign(contact, updateContactDTO);
    return this.contactRepository.save(updatedContact);
  }

  async remove(id: string, user: User): Promise<void> {
    const contact = await this.findOne(id, user);
    if (!contact) {
      throw new NotFoundException('Contact not located');
    }
    await this.contactRepository.remove(contact);
  }

  async exportCsv(user: User): Promise<string> {
    const contacts = await this.contactRepository.find({
      where: { userId: user.id },
      select: ['id', 'name', 'email', 'phone', 'createdAt', ],
    });

    const parser = new Parser({
      fields: ['id', 'name', 'email', 'phone', 'createdAt'],
      header: true,
    });

    return parser.parse(contacts);
  }
}
