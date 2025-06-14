/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { RegisterDTO } from 'src/auth/dto/register.dto';
import { LoginDTO } from 'src/auth/dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  const mockRegisterDto: RegisterDTO = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  };

  const mockLoginDto: LoginDTO = {
    email: 'john@example.com',
    password: 'password123',
  };

  const mockAuthResponse = {
    access_token: 'jwt-token',
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(mockRegisterDto);

      expect(result).toEqual(mockAuthResponse);
      expect(service.register).toHaveBeenCalledWith(mockRegisterDto);
      expect(service.register).toHaveBeenCalledTimes(1);
    });

    it('should handle registration errors', async () => {
      const error = new Error('User already exists');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        'User already exists',
      );
      expect(service.register).toHaveBeenCalledWith(mockRegisterDto);
    });

    it('should validate registration data', async () => {
      const invalidDto = { ...mockRegisterDto, email: 'invalid-email' };
      mockAuthService.register.mockRejectedValue(
        new Error('Invalid email format'),
      );

      await expect(
        controller.register(invalidDto as RegisterDTO),
      ).rejects.toThrow('Invalid email format');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthResponse);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await controller.login(mockLoginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(service.login).toHaveBeenCalledWith(mockLoginDto);
      expect(service.login).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(mockLoginDto);

      consoleSpy.mockRestore();
    });

    it('should handle login errors', async () => {
      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(service.login).toHaveBeenCalledWith(mockLoginDto);
    });

    it('should handle missing credentials', async () => {
      const incompleteDto = { email: 'john@example.com' } as LoginDTO;
      const error = new Error('Password is required');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(incompleteDto)).rejects.toThrow(
        'Password is required',
      );
    });

    it('should log login attempts', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockAuthService.login.mockResolvedValue(mockAuthResponse);

      await controller.login(mockLoginDto);

      expect(consoleSpy).toHaveBeenCalledWith(mockLoginDto);
      consoleSpy.mockRestore();
    });
  });
});
