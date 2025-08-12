import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    await service.onModuleInit(); // Initialize the test user
  });

  describe('validateUser', () => {
    it('should validate a user with correct credentials', async () => {
      const result = await service.validateUser('anand', 'anand0056');
      expect(result).toBeDefined();
      expect(result.username).toBe('anand');
      expect(result.password).toBeUndefined();
    });

    it('should throw UnauthorizedException for invalid username', async () => {
      await expect(service.validateUser('wrong', 'anand0056')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      await expect(
        service.validateUser('anand', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return access token for valid user', async () => {
      const user = { username: 'anand', id: 1 };
      const result = await service.login(user);

      expect(result.access_token).toBe('test-token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: user.username,
        sub: user.id,
      });
    });
  });
});
