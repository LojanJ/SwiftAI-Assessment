/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ContactController } from 'src/contact/contact.controller';
import { ContactService } from 'src/contact//contact.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateContactDTO } from 'src/auth/dto/create-contact.dto';
import { UpdateContactDTO } from 'src/contact/dto/update-contact.dto';
import { Response } from 'express';

describe('ContactController', () => {
  let controller: ContactController;
  let service: ContactService;

  const mockContactService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    exportCsv: jest.fn(),
  };

  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER',
  };

  const mockRequest = {
    user: mockUser,
  };

  const mockContact = {
    id: '1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '1234567890',
    userId: '1',
    profilePhoto: 'photo.jpg',
    createdAt: new Date(),
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

  const mockFile = {
    filename: 'test-photo.jpg',
    originalname: 'photo.jpg',
    mimetype: 'image/jpeg',
  };

  const mockResponse = {
    header: jest.fn(),
    attachment: jest.fn(),
    send: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [
        {
          provide: ContactService,
          useValue: mockContactService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ContactController>(ContactController);
    service = module.get<ContactService>(ContactService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a contact without file', async () => {
      mockContactService.create.mockResolvedValue(mockContact);

      const result = await controller.create(
        mockCreateContactDto,
        null,
        mockRequest,
      );

      expect(result).toEqual(mockContact);
      expect(service.create).toHaveBeenCalledWith(
        mockCreateContactDto,
        mockUser,
      );
      expect(mockCreateContactDto.profilePhoto).toBeUndefined();
    });

    it('should create a contact with file', async () => {
      const contactWithPhoto = {
        ...mockContact,
        profilePhoto: mockFile.filename,
      };
      mockContactService.create.mockResolvedValue(contactWithPhoto);

      const result = await controller.create(
        mockCreateContactDto,
        mockFile,
        mockRequest,
      );

      expect(result).toEqual(contactWithPhoto);
      expect(mockCreateContactDto.profilePhoto).toBe(mockFile.filename);
      expect(service.create).toHaveBeenCalledWith(
        mockCreateContactDto,
        mockUser,
      );
    });

    it('should handle creation errors', async () => {
      const error = new Error('Database error');
      mockContactService.create.mockRejectedValue(error);

      await expect(
        controller.create(mockCreateContactDto, null, mockRequest),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    const mockPaginatedResult = {
      data: [mockContact],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    it('should return paginated contacts with default parameters', async () => {
      mockContactService.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll(mockRequest, 1, 10);

      expect(result).toEqual(mockPaginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(
        mockUser,
        1,
        10,
        undefined,
        'createdAt',
        'DESC',
      );
    });

    it('should return paginated contacts with search and sorting', async () => {
      mockContactService.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll(
        mockRequest,
        2,
        5,
        'jane',
        'name',
        'ASC',
      );

      expect(result).toEqual(mockPaginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(
        mockUser,
        2,
        5,
        'jane',
        'name',
        'ASC',
      );
    });

    it('should handle errors and log them', async () => {
      const error = new Error('Database error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockContactService.findAll.mockRejectedValue(error);

      await expect(controller.findAll(mockRequest, 1, 10)).rejects.toThrow(
        'Database error',
      );
      expect(consoleSpy).toHaveBeenCalledWith('Error in findAll');

      consoleSpy.mockRestore();
    });
  });

  describe('exportCSV', () => {
    it('should export contacts as CSV', async () => {
      const csvData =
        'id,name,email,phone\n1,Jane Smith,jane@example.com,1234567890';
      mockContactService.exportCsv.mockResolvedValue(csvData);

      const result = await controller.exportCSV(mockRequest, mockResponse);

      expect(service.exportCsv).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.header).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv',
      );
      expect(mockResponse.attachment).toHaveBeenCalledWith('contacts.csv');
      expect(mockResponse.send).toHaveBeenCalledWith(csvData);
    });

    it('should handle export errors', async () => {
      const error = new Error('Export failed');
      mockContactService.exportCsv.mockRejectedValue(error);

      await expect(
        controller.exportCSV(mockRequest, mockResponse),
      ).rejects.toThrow('Export failed');
    });
  });

  describe('findOne', () => {
    it('should return a single contact', async () => {
      mockContactService.findOne.mockResolvedValue(mockContact);

      const result = await controller.findOne(mockRequest, '1');

      expect(result).toEqual(mockContact);
      expect(service.findOne).toHaveBeenCalledWith('1', mockUser);
    });

    it('should handle contact not found', async () => {
      const error = new Error('Contact not found');
      mockContactService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(mockRequest, '999')).rejects.toThrow(
        'Contact not found',
      );
    });
  });

  describe('update', () => {
    it('should update a contact without file', async () => {
      const updatedContact = { ...mockContact, ...mockUpdateContactDto };
      mockContactService.update.mockResolvedValue(updatedContact);

      const result = await controller.update(
        '1',
        mockUpdateContactDto,
        null,
        mockRequest,
      );

      expect(result).toEqual(updatedContact);
      expect(service.update).toHaveBeenCalledWith(
        '1',
        mockUpdateContactDto,
        mockUser,
      );
      expect(mockUpdateContactDto.profilePhoto).toBeUndefined();
    });

    it('should update a contact with file', async () => {
      const updatedContact = {
        ...mockContact,
        ...mockUpdateContactDto,
        profilePhoto: mockFile.filename,
      };
      mockContactService.update.mockResolvedValue(updatedContact);

      const result = await controller.update(
        '1',
        mockUpdateContactDto,
        mockFile,
        mockRequest,
      );

      expect(result).toEqual(updatedContact);
      expect(mockUpdateContactDto.profilePhoto).toBe(mockFile.filename);
      expect(service.update).toHaveBeenCalledWith(
        '1',
        mockUpdateContactDto,
        mockUser,
      );
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      mockContactService.update.mockRejectedValue(error);

      await expect(
        controller.update('1', mockUpdateContactDto, null, mockRequest),
      ).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should delete a contact', async () => {
      mockContactService.remove.mockResolvedValue(undefined);

      const result = await controller.delete('1', mockRequest);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('1', mockUser);
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Contact not found');
      mockContactService.remove.mockRejectedValue(error);

      await expect(controller.delete('999', mockRequest)).rejects.toThrow(
        'Contact not found',
      );
    });
  });
});
