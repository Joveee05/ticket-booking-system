import { EventService } from '@/services/event.service';
import { DB } from '@/database';
import { CreateEventDto } from '@/dtos/event.dto';
import { HttpException } from '@/exceptions/HttpException';
import { Sequelize } from 'sequelize';

describe('EventService', () => {
  const eventService = new EventService();
  const db = DB as jest.Mocked<typeof DB>;

  beforeEach(() => {
    (Sequelize as any).authenticate = jest.fn();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    await db.sequelize.close();
  });

  describe('Initialize Event', () => {
    it('should initialize an event successfully', async () => {
      const payload: CreateEventDto = {
        event_name: 'Test Event',
        total_tickets: 100,
        available_tickets: 100,
        status: 'active',
      };

      jest.spyOn(db.Events, 'findOne').mockResolvedValue(null);
      jest.spyOn(db.Events, 'create').mockResolvedValue({
        id: 1,
        event_name: payload.event_name,
        available_tickets: Number(payload.total_tickets),
      });

      const response = await eventService.initializeEvent(payload);

      expect(response.statusCode).toBe(201);
      expect(response.message).toBe('Event initialized successfully');
      expect(response.data).toEqual({
        id: 1,
        event_name: payload.event_name,
        available_tickets: Number(payload.total_tickets),
      });
    });

    it('should throw an error if the event already exists', async () => {
      const payload: CreateEventDto = {
        event_name: 'Test Event',
        total_tickets: 100,
        available_tickets: 100,
        status: 'active',
      };
      jest.spyOn(db.Events, 'findOne').mockResolvedValue({
        id: 1,
        event_name: payload.event_name,
      } as any);

      await expect(eventService.initializeEvent(payload)).rejects.toThrow(
        new HttpException(
          409,
          `This event ${payload.event_name} already exists`
        )
      );
    });
  });

  describe('Get Event Status', () => {
    it('should get event status by id successfully', async () => {
      const event_id = 1;

      jest.spyOn(db.Events, 'findByPk').mockResolvedValue({
        id: event_id,
        event_name: 'Test Event',
      } as any);
      jest.spyOn(db.WaitingLists, 'count').mockResolvedValue(5);

      const response = await eventService.getEventStatusById(event_id);

      expect(response.statusCode).toBe(200);
      expect(response.message).toBe('Event found successfully');
      expect(response.data).toEqual({
        event: {
          id: event_id,
          event_name: 'Test Event',
        },
        waitingListCount: 5,
      });
    });

    it('should throw an error if the event does not exist', async () => {
      const event_id = 1;

      jest.spyOn(db.Events, 'findByPk').mockResolvedValue(null);

      await expect(eventService.getEventStatusById(event_id)).rejects.toThrow(
        new HttpException(404, "Event doesn't exist")
      );
    });
  });
});
