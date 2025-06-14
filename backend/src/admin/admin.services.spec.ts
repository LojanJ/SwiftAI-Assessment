/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from 'src/admin/admin.services';
import { User } from 'src/users/entities/user.entity';
import { Contact } from 'src/contact/entities/contact.entity';

describe('AdminService', () => {
  let service: AdminService;
  let userRepository: Repository<User>;
  let contactRepository: Repository<Contact>;

  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    role: 'USER' as any,
    createdAt: new Date(),
    contacts: [],
  };

  const mockContact = {
    id: '1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '1234567890',
    userId: '1',
    user: mockUser,
    createdAt: new Date(),
  };

  const mockUserRepository = {
    find: jest.fn(),
    delete: jest.fn(),
  };

  const mockContactRepository = {
    find: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Contact),
          useValue: mockContactRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    contactRepository = module.get<Repository<Contact>>(
      getRepositoryToken(Contact),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllContacts', () => {
    it('should return all contacts with user relations', async () => {
      const contacts = [{ ...mockContact, user: mockUser }];
      mockContactRepository.find.mockResolvedValue(contacts);

      const result = await service.getAllContacts();

      expect(contactRepository.find).toHaveBeenCalledWith({
        relations: ['user'],
      });
      expect(result).toEqual(contacts);
    });

    it('should return empty array when no contacts exist', async () => {
      mockContactRepository.find.mockResolvedValue([]);

      const result = await service.getAllContacts();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockContactRepository.find.mockRejectedValue(error);

      await expect(service.getAllContacts()).rejects.toThrow('Database error');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with selected fields and contact relations', async () => {
      const users = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'USER',
          createdAt: new Date(),
          contacts: [mockContact],
        },
        {
          id: '2',
          name: 'Jane Admin',
          email: 'jane@example.com',
          role: 'ADMIN',
          createdAt: new Date(),
          contacts: [],
        },
      ];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.getAllUsers();

      expect(userRepository.find).toHaveBeenCalledWith({
        select: ['id', 'name', 'email', 'role', 'createdAt'],
        relations: ['contacts'],
      });
      expect(result).toEqual(users);
    });

    it('should return empty array when no users exist', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.getAllUsers();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockUserRepository.find.mockRejectedValue(error);

      await expect(service.getAllUsers()).rejects.toThrow('Database error');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by id', async () => {
      const deleteResult = { affected: 1, raw: {} };
      mockUserRepository.delete.mockResolvedValue(deleteResult);

      const result = await service.deleteUser('1');

      expect(userRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(deleteResult);
    });

    it('should return result when user does not exist', async () => {
      const deleteResult = { affected: 0, raw: {} };
      mockUserRepository.delete.mockResolvedValue(deleteResult);

      const result = await service.deleteUser('999');

      expect(userRepository.delete).toHaveBeenCalledWith('999');
      expect(result).toEqual(deleteResult);
    });

    it('should handle database errors during deletion', async () => {
      const error = new Error('Database error');
      mockUserRepository.delete.mockRejectedValue(error);

      await expect(service.deleteUser('1')).rejects.toThrow('Database error');
    });

    it('should handle foreign key constraint errors', async () => {
      const error = new Error('Foreign key constraint violation');
      mockUserRepository.delete.mockRejectedValue(error);

      await expect(service.deleteUser('1')).rejects.toThrow(
        'Foreign key constraint violation',
      );
    });
  });

  describe('deleteContact', () => {
    it('should delete a contact by id', async () => {
      const deleteResult = { affected: 1, raw: {} };
      mockContactRepository.delete.mockResolvedValue(deleteResult);

      const result = await service.deleteContact('1');

      expect(contactRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(deleteResult);
    });

    it('should return result when contact does not exist', async () => {
      const deleteResult = { affected: 0, raw: {} };
      mockContactRepository.delete.mockResolvedValue(deleteResult);

      const result = await service.deleteContact('999');

      expect(contactRepository.delete).toHaveBeenCalledWith('999');
      expect(result).toEqual(deleteResult);
    });

    it('should handle database errors during deletion', async () => {
      const error = new Error('Database error');
      mockContactRepository.delete.mockRejectedValue(error);

      await expect(service.deleteContact('1')).rejects.toThrow(
        'Database error',
      );
    });
  });
});
