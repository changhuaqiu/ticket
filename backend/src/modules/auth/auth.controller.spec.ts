import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserRole } from './entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('用户注册', () => {
    it('should register a user', async () => {
      const registerDto: RegisterDto = {
        username: 'testuser',
        password: 'password',
        name: '测试用户',
        email: 'test@example.com',
        department: '技术部',
      };

      const result = {
        code: 0,
        message: '成功',
        data: {
          id: '1',
          username: 'testuser',
          name: '测试用户',
          email: 'test@example.com',
          role: UserRole.SUBMITTER,
          department: '技术部',
          createdAt: new Date(),
          updatedAt: new Date(),
          submittedTickets: [],
          handledTickets: [],
          comments: [],
        },
      };

      jest.spyOn(service, 'register').mockResolvedValue(result);

      expect(await controller.register(registerDto)).toEqual(result);
    });
  });

  describe('用户登录', () => {
    it('should login successfully', async () => {
      const req = {
        user: {
          username: 'testuser',
          password: 'password',
          id: '1',
          name: '测试用户',
          role: UserRole.SUBMITTER,
          department: '技术部',
        },
      };

      const result = {
        code: 0,
        message: '成功',
        data: {
          token: 'mock-jwt-token',
          user: {
            id: '1',
            username: 'testuser',
            name: '测试用户',
            email: 'test@example.com',
            role: UserRole.SUBMITTER,
            department: '技术部',
          },
        },
      };

      jest.spyOn(service, 'login').mockResolvedValue(result);

      expect(await controller.login(req)).toEqual(result);
    });
  });
});