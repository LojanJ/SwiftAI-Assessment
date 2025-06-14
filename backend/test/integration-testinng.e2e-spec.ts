/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-require-imports */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { ContactModule } from 'src/contact/contact.module';
import { AdminModule } from 'src/admin/admin.module';
import { User } from 'src/users/entities/user.entity';
import { Contact } from 'src/contact/entities/contact.entity';
import { ConfigModule } from '@nestjs/config';

describe('Application Integration Tests', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    role: 'USER',
    createdAt: new Date(),
    contacts: [],
  };

  const mockAdmin = {
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'hashedpassword',
    role: 'ADMIN',
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
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  };

  const mockContactRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1),
      getMany: jest.fn().mockResolvedValue([mockContact]),
    })),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), AuthModule, ContactModule, AdminModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .overrideProvider(getRepositoryToken(Contact))
      .useValue(mockContactRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Auth Endpoints', () => {
    describe('POST /auth/register', () => {
      it('should register a new user', async () => {
        const registerDto = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        };

        mockUserRepository.findOne.mockResolvedValue(null); // User doesn't exist
        mockUserRepository.create.mockReturnValue(mockUser);
        mockUserRepository.save.mockResolvedValue(mockUser);

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(registerDto)
          .expect(201);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body.user).toMatchObject({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        });
      });

      it('should return 400 for duplicate email', async () => {
        const registerDto = {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        };

        mockUserRepository.findOne.mockResolvedValue(mockUser); // User exists

        await request(app.getHttpServer())
          .post('/auth/register')
          .send(registerDto)
          .expect(400);
      });
    });

    describe('POST /auth/login', () => {
      it('should login with valid credentials', async () => {
        const loginDto = {
          email: 'john@example.com',
          password: 'password123',
        };

        mockUserRepository.findOne.mockResolvedValue(mockUser);

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDto)
          .expect(200);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body.user).toMatchObject({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        });
      });

      it('should return 401 for invalid credentials', async () => {
        const loginDto = {
          email: 'john@example.com',
          password: 'wrongpassword',
        };

        mockUserRepository.findOne.mockResolvedValue(null);

        await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDto)
          .expect(401);
      });
    });
  });

  describe('Contact Endpoints (Protected)', () => {
    let authToken: string;

    beforeEach(() => {
      authToken = jwtService.sign({ sub: mockUser.id, email: mockUser.email });
    });

    describe('POST /contacts', () => {
      it('should create a contact with valid data', async () => {
        const createContactDto = {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '1234567890',
        };

        mockContactRepository.create.mockReturnValue(mockContact);
        mockContactRepository.save.mockResolvedValue(mockContact);

        const response = await request(app.getHttpServer())
          .post('/contacts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(createContactDto)
          .expect(201);

        expect(response.body).toMatchObject({
          id: mockContact.id,
          name: mockContact.name,
          email: mockContact.email,
          phone: mockContact.phone,
        });
      });

      it('should return 401 without auth token', async () => {
        const createContactDto = {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '1234567890',
        };

        await request(app.getHttpServer())
          .post('/contacts')
          .send(createContactDto)
          .expect(401);
      });
    });

    describe('GET /contacts', () => {
      it('should return paginated contacts', async () => {
        const response = await request(app.getHttpServer())
          .get('/contacts')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ page: 1, limit: 10 })
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('page');
        expect(response.body).toHaveProperty('limit');
        expect(response.body).toHaveProperty('totalPages');
      });

      it('should support search functionality', async () => {
        const response = await request(app.getHttpServer())
          .get('/contacts')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ search: 'jane', page: 1, limit: 10 })
          .expect(200);

        expect(response.body).toHaveProperty('data');
      });

      it('should support sorting', async () => {
        const response = await request(app.getHttpServer())
          .get('/contacts')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ sortBy: 'name', sortOrder: 'ASC' })
          .expect(200);

        expect(response.body).toHaveProperty('data');
      });
    });

    describe('GET /contacts/export', () => {
      it('should export contacts as CSV', async () => {
        mockContactRepository.find.mockResolvedValue([mockContact]);

        const response = await request(app.getHttpServer())
          .get('/contacts/export')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.headers['content-type']).toContain('text/csv');
        expect(response.headers['content-disposition']).toContain(
          'contacts.csv',
        );
      });
    });

    describe('GET /contacts/:id', () => {
      it('should return a specific contact', async () => {
        mockContactRepository.findOne.mockResolvedValue(mockContact);

        const response = await request(app.getHttpServer())
          .get('/contacts/1')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toMatchObject({
          id: mockContact.id,
          name: mockContact.name,
          email: mockContact.email,
        });
      });

      it('should return 404 for non-existent contact', async () => {
        mockContactRepository.findOne.mockResolvedValue(null);

        await request(app.getHttpServer())
          .get('/contacts/999')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);
      });
    });

    describe('PUT /contacts/:id', () => {
      it('should update a contact', async () => {
        const updateDto = {
          name: 'Jane Updated',
          email: 'jane.updated@example.com',
        };

        const updatedContact = { ...mockContact, ...updateDto };
        mockContactRepository.findOne.mockResolvedValue(mockContact);
        mockContactRepository.save.mockResolvedValue(updatedContact);

        const response = await request(app.getHttpServer())
          .put('/contacts/1')
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateDto)
          .expect(200);

        expect(response.body.name).toBe(updateDto.name);
        expect(response.body.email).toBe(updateDto.email);
      });
    });

    describe('DELETE /contacts/:id', () => {
      it('should delete a contact', async () => {
        mockContactRepository.findOne.mockResolvedValue(mockContact);
        mockContactRepository.remove.mockResolvedValue(mockContact);

        await request(app.getHttpServer())
          .delete('/contacts/1')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      });
    });
  });

  describe('Admin Endpoints (Admin Only)', () => {
    let adminToken: string;

    beforeEach(() => {
      adminToken = jwtService.sign({
        sub: mockAdmin.id,
        email: mockAdmin.email,
        role: 'ADMIN',
      });
    });

    describe('GET /admin/users', () => {
      it('should return all users for admin', async () => {
        mockUserRepository.find.mockResolvedValue([mockUser, mockAdmin]);

        const response = await request(app.getHttpServer())
          .get('/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should deny access to non-admin users', async () => {
        const userToken = jwtService.sign({
          sub: mockUser.id,
          email: mockUser.email,
          role: 'USER',
        });

        await request(app.getHttpServer())
          .get('/admin/users')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });
    });

    describe('GET /admin/contacts', () => {
      it('should return all contacts for admin', async () => {
        mockContactRepository.find.mockResolvedValue([mockContact]);

        const response = await request(app.getHttpServer())
          .get('/admin/contacts')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('DELETE /admin/user/:id', () => {
      it('should delete a user', async () => {
        mockUserRepository.delete.mockResolvedValue({ affected: 1 });

        await request(app.getHttpServer())
          .delete('/admin/user/1')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      });
    });

    describe('DELETE /admin/contact/:id', () => {
      it('should delete a contact', async () => {
        mockContactRepository.delete.mockResolvedValue({ affected: 1 });

        await request(app.getHttpServer())
          .delete('/admin/contact/1')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      });
    });
  });
});
