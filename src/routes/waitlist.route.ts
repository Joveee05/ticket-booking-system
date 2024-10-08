import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { WaitingListController } from '@/controllers/waitlist.controller';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { validateEvent } from '@/middlewares/validateEvent.niddleware';
import { routeLimiter } from '@/utils/routeLimiter';
import { CreateWaitListDto } from '@/dtos/waitlist.dto';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

export class WaitingListRoute implements Routes {
  public path = '/waitinglists';
  public router = Router();
  public controller = new WaitingListController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}`,
      routeLimiter(30),
      AuthMiddleware,
      this.controller.getAllWaitListings
    );

    this.router.post(
      `${this.path}/join-waitlist`,
      routeLimiter(20),
      AuthMiddleware,
      validateEvent,
      ValidationMiddleware(CreateWaitListDto),
      this.controller.joinWaitingList
    );
  }
}
