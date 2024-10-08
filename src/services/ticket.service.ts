import { Service } from 'typedi';
import { DB } from '@database';
import { CreateBookingDto } from '@/dtos/booking.dto';
import { HttpException } from '@/exceptions/HttpException';
import { Event } from '@/interfaces/event.interface';
import { Booking } from '@/interfaces/booking.interface';
import RootService from './root.service';
import { EventResponse, HTTP_STATUS_CODE } from '@/types/custom.types';
import { addUserBooking } from '@/utils/addUserBooking';
import bookTicketForNextInLineUser from '@/utils/bookTicketForNextUser';
import { decrementAvailableTickets } from '@/utils/decrementAvailableTickets';

@Service()
export class TicketService extends RootService {
  public async bookTickets(
    payload: CreateBookingDto,
    quantity: number,
    additionalUsers: number[] = []
  ): Promise<EventResponse<Booking>> {
    if (!quantity || quantity <= 0) {
      throw new HttpException(
        HTTP_STATUS_CODE.BAD_REQUEST,
        'req.body.quantity is required and must be at least 1'
      );
    }
    const transaction = await DB.sequelize.transaction();
    try {
      const event: Event = await DB.Events.findByPk(payload.event_id, {
        lock: true,
        transaction,
      });
      if (!event)
        throw new HttpException(
          HTTP_STATUS_CODE.NOT_FOUND,
          "Event doesn't exist"
        );

      const bookings = [];

      if (event.available_tickets >= quantity) {
        if (additionalUsers.length > 0) {
          for (let i = 0; i < additionalUsers.length; i++) {
            const additionalUserId = additionalUsers[i];
            const booking = await addUserBooking(
              payload.event_id,
              additionalUserId,
              transaction
            );

            bookings.push(booking);
          }
        }

        for (let i = 0; i < quantity - additionalUsers.length; i++) {
          const booking = await addUserBooking(
            payload.event_id,
            payload.user_id,
            transaction
          );
          bookings.push(booking);
        }
        await decrementAvailableTickets(
          payload.event_id,
          quantity,
          transaction
        );

        await transaction.commit();

        const message = `${quantity} ticket${
          bookings?.length > 1 ? 's' : ''
        } for ${event.event_name} booked successfully`;

        return this.processResponse({
          statusCode: HTTP_STATUS_CODE.OK,
          message,
          data: bookings,
        });
      }
    } catch (error) {
      await transaction.rollback();
      console.error('TicketService[bookTicket]: ', error);
      throw error;
    }
  }

  public async cancelBooking(
    payload: Booking
  ): Promise<EventResponse<Booking>> {
    const transaction = await DB.sequelize.transaction();
    try {
      const [, event] = await Promise.all([
        await DB.Bookings.destroy({
          where: { event_id: payload.event_id, user_id: payload.user_id },
          transaction,
        }),
        DB.Events.findByPk(payload.event_id, {
          transaction,
        }),
      ]);

      if (event) {
        await DB.Events.increment('available_tickets', {
          by: 1,
          where: { id: payload.event_id },
          transaction,
        });
      }

      const nextInLine = await DB.WaitingLists.findOne({
        where: { event_id: payload.event_id },
        order: [['createdAt', 'ASC']],
        transaction,
      });

      if (nextInLine) {
        const booking = await bookTicketForNextInLineUser(
          nextInLine,
          payload.event_id,
          transaction
        );

        await transaction.commit();
        return this.processResponse({
          statusCode: HTTP_STATUS_CODE.OK,
          message: `Ticket reassigned to user ${nextInLine.user_id}.`,
          data: booking,
        });
      } else {
        await transaction.commit();
        return this.processResponse({
          statusCode: HTTP_STATUS_CODE.OK,
          message: 'Booking canceled. No users in the waiting list.',
        });
      }
    } catch (error) {
      await transaction.rollback();
      console.error('TicketService[cancelBooking]: ', error);
      throw error;
    }
  }

  public async getAvailableTickets(
    event_id: number
  ): Promise<EventResponse<Event>> {
    try {
      const event = await DB.Events.findByPk(event_id, {
        attributes: ['available_tickets'],
        raw: true,
      });

      if (!event) {
        throw new HttpException(409, "Event doesn't exist");
      }

      return this.processResponse({
        statusCode: HTTP_STATUS_CODE.OK,
        message: 'Available tickets found successfully',
        data: { available_tickets: event.available_tickets },
      });
    } catch (error) {
      console.error('TicketService[getAvailableTickets]: ', error);
      throw error;
    }
  }
}
