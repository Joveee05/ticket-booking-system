import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { CreateUserDto } from '@dtos/users.dto';
import { UserService } from '@services/users.service';

export class UserController {
  public user = Container.get(UserService);

  public getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = Number(req.params.id);
      const findOneUserData = await this.user.getUserById(userId);

      res.json(findOneUserData);
    } catch (error) {
      next(error);
    }
  };

  public updateUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = Number(req.params.id);
      const userData: CreateUserDto = req.body;
      const updateUserData = await this.user.updateUserById(userId, userData);

      res.json(updateUserData);
    } catch (error) {
      next(error);
    }
  };

  public deleteUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = Number(req.params.id);
      const deleteUserData = await this.user.deleteUserById(userId);

      res.json(deleteUserData);
    } catch (error) {
      next(error);
    }
  };
}
