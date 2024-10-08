import { Service } from 'typedi';
import { DB } from '@database';
import { CreateEventDto } from '@/dtos/event.dto';
import { HttpException } from '@/exceptions/HttpException';
import { Event } from '@/interfaces/event.interface';
import RootService from './root.service';
import { EventResponse, HTTP_STATUS_CODE } from '@/types/custom.types';

@Service()
export class EventService extends RootService {
  public async initializeEvent(
    payload: CreateEventDto
  ): Promise<EventResponse<Event>> {
    try {
      const existingEvent: Event = await DB.Events.findOne({
        where: { event_name: payload.event_name },
      });

      if (existingEvent)
        throw new HttpException(
          HTTP_STATUS_CODE.CONFLICT,
          `This event ${payload.event_name} already exists`
        );

      const event: Event = await DB.Events.create({
        ...payload,
        available_tickets: Number(payload.total_tickets),
      });
      return this.processResponse({
        statusCode: HTTP_STATUS_CODE.CREATED,
        message: 'Event initialized successfully',
        data: event,
      });
    } catch (error) {
      console.error('TicketService[initializeEvent]: ', error);
      throw error;
    }
  }

  public async getEventStatusById(
    event_id: number
  ): Promise<EventResponse<Event>> {
    try {
      const event = await DB.Events.findByPk(event_id);
      if (!event) throw new HttpException(404, "Event doesn't exist");

      const waitingListCount = await DB.WaitingLists.count({
        where: { event_id },
      });

      return this.processResponse({
        statusCode: HTTP_STATUS_CODE.OK,
        message: 'Event found successfully',
        data: { event, waitingListCount },
      });
    } catch (error) {
      console.error('TicketService[getEventStatusById]: ', error);
      throw error;
    }
  }
}
