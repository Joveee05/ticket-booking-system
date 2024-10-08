import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { CreateUserDto } from '@dtos/users.dto';
import { AuthService } from '@services/auth.service';
import { HTTP_STATUS_CODE } from '@/types/custom.types';

export class AuthController {
  public auth = Container.get(AuthService);

  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const signUpUserData = await this.auth.signup(userData);

      res.status(HTTP_STATUS_CODE.CREATED).json(signUpUserData);
    } catch (error) {
      next(error);
    }
  };

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: CreateUserDto = req.body;
      const user = await this.auth.login(userData);

      const { cookie, ...userResponse } = user;

      res.setHeader('Set-Cookie', [cookie]);
      res.json(userResponse);
    } catch (error) {
      next(error);
    }
  };
}
