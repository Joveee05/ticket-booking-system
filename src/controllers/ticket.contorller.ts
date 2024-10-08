import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { TicketService } from '@/services/ticket.service';
import { CreateBookingDto } from '@/dtos/booking.dto';

export class TicketController {
  private ticket = Container.get(TicketService);

  public bookTicket = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload: CreateBookingDto = req.body;
      const { quantity, additionalUsers } = req.body;
      const booking = await this.ticket.bookTickets(
        payload,
        quantity,
        additionalUsers
      );

      res.json(booking);
    } catch (error) {
      next(error);
    }
  };

  public cancelBooking = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = req.body;
      const booking = await this.ticket.cancelBooking(payload);

      res.json(booking);
    } catch (error) {
      next(error);
    }
  };

  public getAvailableTickets = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const eventId = parseInt(req.params.event_id, 10);

    try {
      const event = await this.ticket.getAvailableTickets(eventId);
      res.json(event);
    } catch (error) {
      next(error);
    }
  };
}
