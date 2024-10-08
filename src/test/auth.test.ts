import {
  AuthService,
  createToken,
  createCookie,
} from '@/services/auth.service';
import { DB } from '@/database';
import { CreateUserDto } from '@/dtos/users.dto';
import { User } from '@/interfaces/users.interface';
import { HttpException } from '@/exceptions/HttpException';
import { compare } from 'bcrypt';
import { Sequelize } from 'sequelize';

describe('AuthService', () => {
  const authService = new AuthService();
  const db = DB as jest.Mocked<typeof DB>;

  beforeEach(() => {
    (Sequelize as any).authenticate = jest.fn();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
    await db.sequelize.close();
  });

  describe('Login', () => {
    it('should login a user', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const findUser: User = {
        id: 1,
        email: userData.email,
        password: 'hashedPassword',
      };

      jest.spyOn(db.Users, 'findOne').mockResolvedValue(findUser as any);
      const compareMock = jest.fn(() => Promise.resolve(true));
      (compare as jest.Mock) = compareMock;
      const createTokenMock = jest.fn(() => ({ token: 'token' }));
      (createToken as jest.Mock) = createTokenMock;
      const createCookieMock = jest.fn(() => 'cookie');
      (createCookie as jest.Mock) = createCookieMock;

      const response = await authService.login(userData);

      expect(response.statusCode).toBe(200);
      expect(response.message).not.toBeNull();
      expect(response.cookie).toBe('cookie');
      expect(response.data).toBe('token');
    });

    it('should throw an error if the email is incorrect', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(db.Users, 'findOne').mockResolvedValue(null);

      await expect(authService.login(userData)).rejects.toThrow(
        new HttpException(409, `Incorrect email ${userData.email} or password`)
      );
    });

    it('should throw an error if the password is incorrect', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      const findUser: User = {
        id: 1,
        email: userData.email,
        password: 'hashedPassword',
      };

      jest.spyOn(db.Users, 'findOne').mockResolvedValue(findUser as any);
      const compareMock = jest.fn(() => Promise.resolve(false));
      (compare as jest.Mock) = compareMock;

      await expect(authService.login(userData)).rejects.toThrow(
        new HttpException(409, `Incorrect email ${userData.email} or password`)
      );
    });

    it('should throw an error if there is a database error', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest
        .spyOn(db.Users, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(authService.login(userData)).rejects.toThrow(
        new Error('Database error')
      );
    });
  });

  describe('SignUp', () => {
    it('should create a new user', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(db.Users, 'findOne').mockResolvedValue(null);
      jest.spyOn(db.Users, 'create').mockResolvedValue({
        id: 1,
        email: userData.email,
        password: 'hashedPassword',
      });
      const response = await authService.signup(userData);

      expect(response.statusCode).toBe(201);
      expect(response.message).not.toBeNull();
      expect(response.data).toEqual({
        id: 1,
        email: userData.email,
      });
    });

    it('should throw an error if the email already exists', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(db.Users, 'findOne').mockResolvedValue({
        id: 1,
        email: userData.email,
        password: 'hashedPassword',
      } as any);

      await expect(authService.signup(userData)).rejects.toThrow(
        new HttpException(409, `This email ${userData.email} already exists`)
      );
    });

    it('should throw an error if there is a database error', async () => {
      const userData: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      jest
        .spyOn(db.Users, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(authService.signup(userData)).rejects.toThrow(
        new Error('Database error')
      );
    });
  });
});
