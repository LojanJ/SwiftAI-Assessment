/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from 'src/admin/admin.controller';
import { AdminService } from 'src/admin/admin.services';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { UserRole } from 'src/users/entities/user.entity';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  const mockAdminService = {
    getAllUsers: jest.fn(),
    getAllContacts: jest.fn(),
    deleteUser: jest.fn(),
    deleteContact: jest.fn(),
  };

  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: UserRole.USER,
    createdAt: new Date(),
  };

  const mockContact = {
    id: '1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '1234567890',
    userId: '1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      mockAdminService.getAllUsers.mockResolvedValue(users);

      const result = await controller.getAllUsers();

      expect(result).toEqual(users);
      expect(service.getAllUsers).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockAdminService.getAllUsers.mockRejectedValue(error);

      await expect(controller.getAllUsers()).rejects.toThrow('Database error');
    });
  });

  describe('getAllContacts', () => {
    it('should return all contacts', async () => {
      const contacts = [mockContact];
      mockAdminService.getAllContacts.mockResolvedValue(contacts);

      const result = await controller.getAllContacts();

      expect(result).toEqual(contacts);
      expect(service.getAllContacts).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockAdminService.getAllContacts.mockRejectedValue(error);

      await expect(controller.getAllContacts()).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by id', async () => {
      const userId = '1';
      const deleteResult = { affected: 1 };
      mockAdminService.deleteUser.mockResolvedValue(deleteResult);

      const result = await controller.deleteUser(userId);

      expect(result).toEqual(deleteResult);
      expect(service.deleteUser).toHaveBeenCalledWith(userId);
      expect(service.deleteUser).toHaveBeenCalledTimes(1);
    });

    it('should handle deletion errors', async () => {
      const userId = '1';
      const error = new Error('User not found');
      mockAdminService.deleteUser.mockRejectedValue(error);

      await expect(controller.deleteUser(userId)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('deleteContact', () => {
    it('should delete a contact by id', async () => {
      const contactId = '1';
      const deleteResult = { affected: 1 };
      mockAdminService.deleteContact.mockResolvedValue(deleteResult);

      const result = await controller.deleteContact(contactId);

      expect(result).toEqual(deleteResult);
      expect(service.deleteContact).toHaveBeenCalledWith(contactId);
      expect(service.deleteContact).toHaveBeenCalledTimes(1);
    });

    it('should handle deletion errors', async () => {
      const contactId = '1';
      const error = new Error('Contact not found');
      mockAdminService.deleteContact.mockRejectedValue(error);

      await expect(controller.deleteContact(contactId)).rejects.toThrow(
        'Contact not found',
      );
    });
  });
});
