import { Router } from 'express';
import { TicketController } from '@/controllers/ticket.contorller';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';
import { validateEvent } from '@/middlewares/validateEvent.niddleware';
import {
  checkIfBooked,
  checkAvailableTickets,
} from '@/middlewares/booking.middleware';
import { routeLimiter } from '@/utils/routeLimiter';
import { CreateBookingDto } from '@/dtos/booking.dto';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

export class TicketRoute implements Routes {
  public path = '/tickets';
  public router = Router();
  public controller = new TicketController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/available-tickets/:event_id`,
      routeLimiter(30),
      AuthMiddleware,
      validateEvent,
      this.controller.getAvailableTickets
    );

    this.router.post(
      `${this.path}/book`,
      routeLimiter(10),
      AuthMiddleware,
      validateEvent,
      checkIfBooked(),
      checkAvailableTickets,
      ValidationMiddleware(CreateBookingDto),
      this.controller.bookTicket
    );

    this.router.post(
      `${this.path}/cancel`,
      routeLimiter(10),
      AuthMiddleware,
      validateEvent,
      checkIfBooked(true),
      this.controller.cancelBooking
    );
  }
}
