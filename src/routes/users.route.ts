import { Router } from 'express';
import { UserController } from '@controllers/users.controller';
import { UpdateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

export class UserRoute implements Routes {
  public path = '/users';
  public router = Router();
  public controller = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/:id`,
      AuthMiddleware,
      this.controller.getUserById
    );

    this.router.put(
      `${this.path}/:id`,
      AuthMiddleware,
      ValidationMiddleware(UpdateUserDto, true),
      this.controller.updateUserById
    );

    this.router.delete(
      `${this.path}/:id`,
      AuthMiddleware,
      this.controller.deleteUserById
    );
  }
}
