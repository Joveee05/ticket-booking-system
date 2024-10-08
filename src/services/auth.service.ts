import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Service } from 'typedi';
import { SECRET_KEY } from '@config';
import { DB } from '@database';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@/exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import RootService from './root.service';
import { HTTP_STATUS_CODE, AuthResponse } from '@/types/custom.types';

export const createToken = (user: User): TokenData => {
  const dataStoredInToken: DataStoredInToken = { id: user.id };
  const expiresIn: number = 60 * 60;

  return {
    expiresIn,
    token: sign(dataStoredInToken, SECRET_KEY, { expiresIn }),
  };
};

export const createCookie = (tokenData: TokenData): string => {
  return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
};

@Service()
export class AuthService extends RootService {
  public async signup(userData: CreateUserDto): Promise<AuthResponse<User>> {
    try {
      const findUser: User = await DB.Users.findOne({
        where: { email: userData.email },
      });
      if (findUser)
        throw new HttpException(
          HTTP_STATUS_CODE.CONFLICT,
          `This email ${userData.email} already exists`
        );

      const hashedPassword = await hash(userData.password, 10);
      const createUserData: User = await DB.Users.create({
        ...userData,
        password: hashedPassword,
      });

      delete createUserData.password;
      return this.processResponse({
        statusCode: HTTP_STATUS_CODE.CREATED,
        message: 'User created successfully',
        data: createUserData,
      });
    } catch (error) {
      console.error('AuthService[signup]: ', error);
      throw error;
    }
  }

  public async login(userData: CreateUserDto): Promise<AuthResponse<User>> {
    const findUser: User = await DB.Users.findOne({
      where: { email: userData.email },
    });
    if (!findUser)
      throw new HttpException(
        HTTP_STATUS_CODE.CONFLICT,
        `Incorrect email ${userData.email} or password`
      );

    const isPasswordMatching: boolean = await compare(
      userData.password,
      findUser.password
    );
    if (!isPasswordMatching)
      throw new HttpException(
        HTTP_STATUS_CODE.CONFLICT,
        `Incorrect email ${userData.email} or password`
      );

    const tokenData = createToken(findUser);
    const cookie = createCookie(tokenData);

    return this.processResponse({
      statusCode: HTTP_STATUS_CODE.OK,
      message: 'Login successfully',
      cookie,
      data: tokenData.token,
    });
  }
}
