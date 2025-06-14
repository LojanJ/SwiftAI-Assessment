/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserService } from 'src/users/user.services';
import { User } from 'src/users/entities/user.entity';
import { RegisterDTO } from 'src/auth/dto/register.dto';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    role: 'USER' as any,
    createdAt: new Date(),
    contacts: [],
  };

  const mockRegisterDto: RegisterDTO = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user when email does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null); // User doesn't exist
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(mockRegisterDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: mockRegisterDto.email },
      });
      expect(repository.create).toHaveBeenCalledWith(mockRegisterDto);
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user with email already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser); // User exists

      await expect(service.create(mockRegisterDto)).rejects.toThrow(
        'User with this credentials already exists',
      );
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should handle database errors during creation', async () => {
      const error = new Error('Database error');
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockRejectedValue(error);

      await expect(service.create(mockRegisterDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findAll', () => {
    it('should return all users with selected fields', async () => {
      const users = [
        {
          id: '1',
          email: 'john@example.com',
          name: 'John Doe',
          role: 'USER',
          createdAt: new Date(),
        },
        {
          id: '2',
          email: 'jane@example.com',
          name: 'Jane Smith',
          role: 'ADMIN',
          createdAt: new Date(),
        },
      ];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        select: ['id', 'email', 'name', 'role', 'createdAt'],
      });
      expect(result).toEqual(users);
    });

    it('should handle empty user list', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockRepository.find.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('999')).rejects.toThrow('User not found');
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockRepository.findOne.mockRejectedValue(error);

      await expect(service.findOne('1')).rejects.toThrow('Database error');
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by email', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockRepository.findOne.mockRejectedValue(error);

      await expect(service.findByEmail('john@example.com')).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('remove', () => {
    it('should remove a user by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.remove.mockResolvedValue(mockUser);

      await service.remove('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(repository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException when user not found for removal', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
      await expect(service.remove('999')).rejects.toThrow('User not found');
      expect(repository.remove).not.toHaveBeenCalled();
    });

    it('should handle database errors during removal', async () => {
      const error = new Error('Database error');
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.remove.mockRejectedValue(error);

      await expect(service.remove('1')).rejects.toThrow('Database error');
    });
  });
});
