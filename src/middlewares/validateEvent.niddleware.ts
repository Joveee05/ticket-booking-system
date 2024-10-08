import { DB } from '@/database';
import { HttpException } from '@/exceptions/HttpException';
import { EventStatus, HTTP_STATUS_CODE } from '@/types/custom.types';
import { Request, Response, NextFunction } from 'express';

export const validateEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const event_id = req.body.event_id || Number(req.params.event_id);

  if (!event_id || isNaN(event_id)) {
    return next(
      new HttpException(HTTP_STATUS_CODE.NOT_FOUND, 'Invalid event ID provided')
    );
  }

  try {
    const event = await DB.Events.findByPk(event_id);

    if (!event || event.status === EventStatus.CANCELLED) {
      return next(
        new HttpException(HTTP_STATUS_CODE.NOT_FOUND, 'Event not found')
      );
    }

    next();
  } catch (error) {
    return next(error);
  }
};
