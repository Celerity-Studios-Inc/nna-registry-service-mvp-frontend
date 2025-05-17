import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const mockService = {
      register: jest.fn(),
      login: jest.fn(),
      makeAdmin: jest.fn(),
      getProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it.skip('should register a user and return a JWT token', async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };
      const mockToken = { 
        token: 'test-jwt-token',
        user: {
          id: 'testid123',
          email: 'test@example.com',
          username: 'testuser',
          role: UserRole.Editor
        }
      };

      jest.spyOn(service, 'register').mockResolvedValue(mockToken);

      const result = await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        success: true,
        data: mockToken,
        metadata: expect.objectContaining({
          timestamp: expect.any(String),
        }),
      });
    });
  });

  describe('login', () => {
    it.skip('should login a user and return a JWT token', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockToken = { 
        token: 'test-jwt-token',
        user: {
          id: 'testid123',
          email: 'test@example.com',
          username: 'testuser',
          role: UserRole.Editor
        }
      };

      jest.spyOn(service, 'login').mockResolvedValue(mockToken);

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({
        success: true,
        data: mockToken,
        metadata: expect.objectContaining({
          timestamp: expect.any(String),
        }),
      });
    });
  });

  describe('makeAdmin', () => {
    it('should make a user an admin', async () => {
      const email = 'user@example.com';
      const mockUser = { email, role: 'admin' };

      jest.spyOn(service, 'makeAdmin').mockResolvedValue(mockUser as any);

      const result = await controller.makeAdmin(email);

      expect(service.makeAdmin).toHaveBeenCalledWith(email);
      expect(result).toEqual({
        success: true,
        data: mockUser,
        metadata: expect.objectContaining({
          timestamp: expect.any(String),
        }),
      });
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const req = { user: { userId: 'userId123' } };
      const mockUser = { email: 'test@example.com', role: 'user' };

      jest.spyOn(service, 'getProfile').mockResolvedValue(mockUser as any);

      const result = await controller.getProfile(req);

      expect(service.getProfile).toHaveBeenCalledWith(req.user.userId);
      expect(result).toEqual({
        success: true,
        data: mockUser,
        metadata: expect.objectContaining({
          timestamp: expect.any(String),
        }),
      });
    });
  });
});