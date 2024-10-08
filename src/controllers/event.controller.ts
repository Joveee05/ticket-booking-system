import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { CreateEventDto } from '@/dtos/event.dto';
import { EventService } from '@/services/event.service';
import { HTTP_STATUS_CODE } from '@/types/custom.types';

export class EventController {
  private event = Container.get(EventService);

  public createEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload: CreateEventDto = req.body;
      const event = await this.event.initializeEvent(payload);
      res.status(HTTP_STATUS_CODE.CREATED).json(event);
    } catch (error) {
      next(error);
    }
  };

  public getEventStatusById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const event_id = Number(req.params.event_id);
      const event = await this.event.getEventStatusById(event_id);

      res.json(event);
    } catch (error) {
      next(error);
    }
  };
}
