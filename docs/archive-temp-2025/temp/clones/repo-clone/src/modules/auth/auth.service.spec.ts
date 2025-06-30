import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User } from '../../models/user.schema';
import { HttpException } from '@nestjs/common';
import { TestConfigModule } from '../../test/test.config';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: any;
  let jwtService: any;

  beforeEach(async () => {
    // Create a mock constructor function
    class MockUserModel {
      _id: string;
      role: string;
      username?: string;
      email?: string;
      password?: string;
      save: jest.Mock;
      comparePassword: jest.Mock;

      constructor(dto: any) {
        Object.assign(this, dto);
        this._id = 'mockUserId';
        this.role = 'user';
        this.save = jest.fn().mockImplementation(() => Promise.resolve(this));
        this.comparePassword = jest.fn().mockResolvedValue(true);
      }

      static findOne = jest.fn();
      static findById = jest.fn();
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [TestConfigModule],
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock.jwt.token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      userModel.findOne.mockResolvedValue(null);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual({
        id: 'mockUserId',
        username: registerDto.username,
        email: registerDto.email,
        role: 'user'
      });
    });

    it('should throw an exception if user already exists', async () => {
      const registerDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      userModel.findOne.mockResolvedValue({ email: registerDto.email });

      await expect(service.register(registerDto)).rejects.toThrow(HttpException);
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: 'mockUserId',
        email: loginDto.email,
        username: 'testuser',
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      userModel.findOne.mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual({
        id: mockUser._id,
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role
      });
    });

    it('should throw an exception if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      userModel.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(HttpException);
    });

    it('should throw an exception if password is incorrect', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        _id: 'mockUserId',
        email: loginDto.email,
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      userModel.findOne.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(HttpException);
    });
  });

  describe('makeAdmin', () => {
    it('should make a user an admin', async () => {
      const email = 'user@example.com';
      const mockUser = {
        email,
        role: 'user',
        save: jest.fn().mockResolvedValue(true),
      };

      userModel.findOne.mockResolvedValue(mockUser);

      await service.makeAdmin(email);

      expect(userModel.findOne).toHaveBeenCalledWith({ email });
      expect(mockUser.role).toBe('admin');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw an error if user does not exist', async () => {
      const email = 'nonexistent@example.com';

      userModel.findOne.mockResolvedValue(null);

      await expect(service.makeAdmin(email)).rejects.toThrow(HttpException);
      expect(userModel.findOne).toHaveBeenCalledWith({ email });
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      const userId = 'someId';
      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        role: 'user',
      };

      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      userModel.findById.mockReturnValue({ select: mockSelect });

      const result = await service.getProfile(userId);

      expect(userModel.findById).toHaveBeenCalledWith(userId);
      expect(mockSelect).toHaveBeenCalledWith('-password');
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if user does not exist', async () => {
      const userId = 'nonexistentId';

      const mockSelect = jest.fn().mockResolvedValue(null);
      userModel.findById.mockReturnValue({ select: mockSelect });

      await expect(service.getProfile(userId)).rejects.toThrow(HttpException);
      expect(userModel.findById).toHaveBeenCalledWith(userId);
      expect(mockSelect).toHaveBeenCalledWith('-password');
    });
  });
});