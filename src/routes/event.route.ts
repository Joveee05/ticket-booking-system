import { Router } from 'express';
import { EventController } from '@/controllers/event.controller';
import { CreateEventDto } from '@/dtos/event.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { validateEvent } from '@/middlewares/validateEvent.niddleware';
import { routeLimiter } from '@/utils/routeLimiter';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

export class EventRoute implements Routes {
  public path = '/events';
  public router = Router();
  public controller = new EventController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/status/:event_id`,
      routeLimiter(30),
      AuthMiddleware,
      validateEvent,
      this.controller.getEventStatusById
    );

    this.router.post(
      `${this.path}/initialize`,
      routeLimiter(20),
      AuthMiddleware,
      ValidationMiddleware(CreateEventDto),
      this.controller.createEvent
    );
  }
}
