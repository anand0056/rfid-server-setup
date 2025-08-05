import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    await authService.onModuleInit(); // Initialize the test user
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const loginDto = {
        username: 'anand',
        password: 'anand0056',
      };

      const result = await controller.login(loginDto);
      expect(result).toBeDefined();
      expect(result.access_token).toBeDefined();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        username: 'wrong',
        password: 'wrong',
      };

      await expect(controller.login(loginDto)).rejects.toThrow();
    });
  });

  describe('profile', () => {
    it('should return user profile', () => {
      const mockUser = { username: 'anand', id: 1 };
      const mockRequest = { user: mockUser };
      const profile = controller.getProfile(mockRequest);
      expect(profile).toEqual(mockUser);
    });
  });
});
