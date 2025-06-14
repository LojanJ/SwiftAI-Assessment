/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ContactService } from 'src/contact/contact.service';
import { Contact } from 'src/contact/entities/contact.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateContactDTO } from 'src/auth/dto/create-contact.dto';
import { UpdateContactDTO } from 'src/contact/dto/update-contact.dto';

describe('ContactService', () => {
  let service: ContactService;
  let repository: Repository<Contact>;

  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    role: 'USER' as any,
    createdAt: new Date(),
    contacts: [],
  };
  const mockContact: Contact = {
    id: '1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '1234567890',
    profilePhoto: 'photo.jpg',
    userId: '1',
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateContactDto: CreateContactDTO = {
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '1234567890',
  };

  const mockUpdateContactDto: UpdateContactDTO = {
    name: 'Jane Updated',
    email: 'jane.updated@example.com',
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    getMany: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        {
          provide: getRepositoryToken(Contact),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
    repository = module.get<Repository<Contact>>(getRepositoryToken(Contact));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new contact', async () => {
      const expectedContact = { ...mockCreateContactDto, userId: mockUser.id };
      mockRepository.create.mockReturnValue(expectedContact);
      mockRepository.save.mockResolvedValue(mockContact);

      const result = await service.create(mockCreateContactDto, mockUser);

      expect(repository.create).toHaveBeenCalledWith({
        ...mockCreateContactDto,
        userId: mockUser.id,
      });
      expect(repository.save).toHaveBeenCalledWith(expectedContact);
      expect(result).toEqual(mockContact);
    });

    it('should handle creation errors', async () => {
      const error = new Error('Database error');
      mockRepository.create.mockReturnValue(mockCreateContactDto);
      mockRepository.save.mockRejectedValue(error);

      await expect(
        service.create(mockCreateContactDto, mockUser),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    const mockContacts = [mockContact];
    const mockPaginatedResult = {
      data: mockContacts,
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    beforeEach(() => {
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue(mockContacts);
    });

    it('should return paginated contacts with default parameters', async () => {
      const result = await service.findAll(mockUser);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('contact');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'contact.userId = :userId',
        { userId: mockUser.id },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'contact.createdAt',
        'DESC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return paginated contacts with search', async () => {
      const search = 'jane';
      const result = await service.findAll(mockUser, 1, 10, search);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(contact.name ILIKE :search OR contact.email ILIKE :search)',
        { search: `%${search}%` },
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return paginated contacts with custom sorting', async () => {
      const result = await service.findAll(
        mockUser,
        2,
        5,
        undefined,
        'name',
        'ASC',
      );

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'contact.name',
        'ASC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockQueryBuilder.getCount.mockRejectedValue(error);

      await expect(service.findAll(mockUser)).rejects.toThrow('Database error');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in findAll contacts:',
        error,
      );

      consoleSpy.mockRestore();
    });
  });

  describe('findOne', () => {
    it('should return a contact by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockContact);

      const result = await service.findOne('1', mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1', userId: mockUser.id },
      });
      expect(result).toEqual(mockContact);
    });

    it('should throw NotFoundException when contact not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999', mockUser)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('999', mockUser)).rejects.toThrow(
        'Contact not located',
      );
    });
  });

  describe('update', () => {
    it('should update a contact', async () => {
      const updatedContact = { ...mockContact, ...mockUpdateContactDto };
      mockRepository.findOne.mockResolvedValue(mockContact);
      mockRepository.save.mockResolvedValue(updatedContact);

      const result = await service.update('1', mockUpdateContactDto, mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1', userId: mockUser.id },
      });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(mockUpdateContactDto),
      );
      expect(result).toEqual(updatedContact);
    });

    it('should throw NotFoundException when contact not found for update', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('999', mockUpdateContactDto, mockUser),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update('999', mockUpdateContactDto, mockUser),
      ).rejects.toThrow('Contact not located');
    });
  });

  describe('remove', () => {
    it('should remove a contact', async () => {
      mockRepository.findOne.mockResolvedValue(mockContact);
      mockRepository.remove.mockResolvedValue(mockContact);

      await service.remove('1', mockUser);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1', userId: mockUser.id },
      });
      expect(repository.remove).toHaveBeenCalledWith(mockContact);
    });

    it('should throw NotFoundException when contact not found for removal', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999', mockUser)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('999', mockUser)).rejects.toThrow(
        'Contact not located',
      );
    });
  });

  describe('exportCsv', () => {
    it('should export contacts to CSV', async () => {
      const contacts = [
        {
          id: '1',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '1234567890',
          createdAt: new Date('2023-01-01'),
        },
      ];
      mockRepository.find.mockResolvedValue(contacts);

      const result = await service.exportCsv(mockUser);

      expect(repository.find).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        select: ['id', 'name', 'email', 'phone', 'createdAt'],
      });

      // Check if result is a string (CSV format)
      expect(typeof result).toBe('string');
      expect(result).toContain('id,name,email,phone,createdAt');
      expect(result).toContain('Jane Smith');
    });

    it('should handle empty contacts for CSV export', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.exportCsv(mockUser);

      expect(typeof result).toBe('string');
      expect(result).toContain('id,name,email,phone,createdAt');
    });

    it('should handle CSV export errors', async () => {
      const error = new Error('Database error');
      mockRepository.find.mockRejectedValue(error);

      await expect(service.exportCsv(mockUser)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
