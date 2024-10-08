import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { WaitingListService } from '@/services/waitlist.service';
import { CreateBookingDto, UpdateBookingDto } from '@/dtos/booking.dto';
import { CreateWaitListDto } from '@/dtos/waitlist.dto';

export class WaitingListController {
  private waitList = Container.get(WaitingListService);

  public getAllWaitListings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.waitList.getAllWaitListings();

      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  public joinWaitingList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload: CreateWaitListDto = req.body;
      const result = await this.waitList.joinWaitingList(payload);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
