import { TicketService } from '@/services/ticket.service';
import { DB } from '@/database';
import { CreateBookingDto } from '@/dtos/booking.dto';
import { HttpException } from '@/exceptions/HttpException';
import { Sequelize } from 'sequelize';
import { checkIfBooked } from '@/middlewares/booking.middleware';
import { Request, Response } from 'express';
import * as bookTicketForNextInLineUser from '@/utils/bookTicketForNextUser';

describe('TicketService', () => {
  const ticketService = new TicketService();
  const db = DB as jest.Mocked<typeof DB>;

  beforeEach(() => {
    (Sequelize as any).authenticate = jest.fn();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    await db.sequelize.close();
  });

  describe('bookTickets', () => {
    it('should book tickets successfully', async () => {
      const payload: CreateBookingDto = {
        event_id: 1,
        user_id: 1,
        status: 'booked',
      };
      const quantity = 3;
      const additionalUsers = [2, 3];

      jest.spyOn(DB.Events, 'findByPk').mockResolvedValue({
        id: 1,
        event_name: 'Test Event',
        available_tickets: 10,
      } as any);

      jest.spyOn(DB.Bookings, 'create').mockResolvedValue({
        id: 1,
        event_id: 1,
        user_id: 1,
      } as any);

      jest.spyOn(DB.Bookings, 'create').mockResolvedValueOnce({
        id: 2,
        event_id: 1,
        user_id: 2,
      } as any);

      jest.spyOn(DB.Bookings, 'create').mockResolvedValueOnce({
        id: 3,
        event_id: 1,
        user_id: 3,
      } as any);

      jest.spyOn(DB.Events, 'decrement').mockResolvedValue({
        id: 1,
        event_name: 'Test Event',
        available_tickets: 8,
      } as any);

      const response = await ticketService.bookTickets(
        payload,
        quantity,
        additionalUsers
      );

      expect(response.statusCode).toBe(200);
      expect(response.message).not.toBeNull();
      expect(response.data).toHaveLength(3);
    });

    it('should throw an error if quantity is not provided or is less than 1', async () => {
      const payload: CreateBookingDto = {
        event_id: 1,
        user_id: 1,
        status: 'booked',
      };

      await expect(ticketService.bookTickets(payload, 0)).rejects.toThrow(
        new HttpException(
          400,
          'req.body.quantity is required and must be at least 1'
        )
      );
    });

    it('should throw an error if event does not exist', async () => {
      const payload: CreateBookingDto = {
        event_id: 1,
        user_id: 1,
        status: 'booked',
      };
      const quantity = 2;

      jest.spyOn(DB.Events, 'findByPk').mockResolvedValue(null);

      await expect(
        ticketService.bookTickets(payload, quantity)
      ).rejects.toThrow(new HttpException(409, "Event doesn't exist"));
    });
  });

  describe('checkIfBooked', () => {
    it('should throw an error if booking already exists', async () => {
      let res: Partial<Response>;
      const req = {
        body: {
          user_id: 1,
          event_id: 1,
        },
      } as Request;

      jest.spyOn(DB.Bookings, 'findOne').mockResolvedValue({
        id: 1,
        user_id: 1,
        event_id: 1,
      } as any);

      const next = jest.fn((error) => {
        if (error) {
          throw error;
        }
      });

      await expect(checkIfBooked()(req, res as Response, next)).rejects.toThrow(
        new HttpException(
          400,
          'Booking already exists. This user has already booked for this event'
        )
      );
    });

    it('should not throw an error if booking does not exist', async () => {
      let res: Partial<Response>;
      const req = {
        body: {
          user_id: 1,
          event_id: 1,
        },
      } as Request;

      jest.spyOn(DB.Bookings, 'findOne').mockResolvedValue(null);

      await expect(
        checkIfBooked()(req, res as Response, () => {})
      ).resolves.not.toThrow();
    });
  });

  describe('cancelBooking', () => {
    const ticketService = new TicketService();

    it('should cancel booking and reassign ticket to next in line user', async () => {
      const payload = {
        event_id: 1,
        user_id: 1,
        status: 'booked',
      };

      const booking = {
        id: 1,
        event_id: 1,
        user_id: 2,
      } as any;

      jest.spyOn(DB.Bookings, 'destroy').mockResolvedValue([1] as any);
      jest.spyOn(DB.Events, 'findByPk').mockResolvedValue({
        id: 1,
        available_tickets: 1,
      } as any);
      jest.spyOn(DB.Events, 'increment').mockResolvedValue([1] as any);
      jest.spyOn(DB.WaitingLists, 'findOne').mockResolvedValue({
        id: 1,
        event_id: 1,
        user_id: 2,
      } as any);

      jest
        .spyOn(bookTicketForNextInLineUser, 'default')
        .mockResolvedValue(booking);

      const result = await ticketService.cancelBooking(payload);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Ticket reassigned to user 2.',
        data: booking,
      });
    });

    it('should cancel booking and return no users in waiting list', async () => {
      const payload = {
        event_id: 1,
        user_id: 1,
        status: 'booked',
      };

      jest.spyOn(DB.Bookings, 'destroy').mockResolvedValue([1] as any);
      jest.spyOn(DB.Events, 'findByPk').mockResolvedValue({
        id: 1,
        available_tickets: 1,
      } as any);
      jest.spyOn(DB.Events, 'increment').mockResolvedValue([1] as any);
      jest.spyOn(DB.WaitingLists, 'findOne').mockResolvedValue(null);

      const result = await ticketService.cancelBooking(payload);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Booking canceled. No users in the waiting list.',
      });
    });

    it('should throw error if booking cancellation fails', async () => {
      const payload = {
        event_id: 1,
        user_id: 1,
        status: 'booked',
      };

      jest
        .spyOn(DB.Bookings, 'destroy')
        .mockRejectedValue(new Error('Booking cancellation failed'));

      await expect(ticketService.cancelBooking(payload)).rejects.toThrowError(
        'Booking cancellation failed'
      );
    });
  });

  describe('getAvailableTickets', () => {
    it('should get available tickets for an event', async () => {
      const event_id = 1;

      jest.spyOn(DB.Events, 'findByPk').mockResolvedValue({
        id: 1,
        available_tickets: 10,
      } as any);

      const result = await ticketService.getAvailableTickets(event_id);
      expect(result).toEqual({
        statusCode: 200,
        message: 'Available tickets found successfully',
        data: { available_tickets: 10 },
      });
    });

    it('should throw error if event does not exist', async () => {
      const event_id = 1;

      jest.spyOn(DB.Events, 'findByPk').mockResolvedValue(null);

      await expect(
        ticketService.getAvailableTickets(event_id)
      ).rejects.toThrowError(new HttpException(409, "Event doesn't exist"));
    });
  });
});
