import { Service } from 'typedi';
import { DB } from '@database';
import { HttpException } from '@/exceptions/HttpException';
import { WaitingList } from '@/interfaces/waitListing.interface';
import { CreateWaitListDto } from '@/dtos/waitlist.dto';
import RootService from './root.service';
import { EventResponse, HTTP_STATUS_CODE } from '@/types/custom.types';
import { addUserToWaitList } from '@/utils/addUserToWaitList';
import { isUserInWaitingList } from '@/utils/isUserInWaitingList';

@Service()
export class WaitingListService extends RootService {
  public async getAllWaitListings(): Promise<EventResponse<WaitingList[]>> {
    const waitingListings: WaitingList[] = await DB.WaitingLists.findAll();

    const message = `WaitList${
      waitingListings?.length > 1 ? 's' : ''
    } found successfully`;

    return this.processResponse({
      statusCode: HTTP_STATUS_CODE.OK,
      message,
      data: waitingListings,
    });
  }

  public async joinWaitingList(
    payload: CreateWaitListDto
  ): Promise<EventResponse<WaitingList>> {
    const transaction = await DB.sequelize.transaction();
    try {
      const alreadyInWaitingList = await isUserInWaitingList(
        payload.user_id,
        payload.event_id
      );
      if (alreadyInWaitingList) {
        throw new HttpException(
          HTTP_STATUS_CODE.CONFLICT,
          'This user is already in the waiting list for this event'
        );
      }

      const waitingList = await addUserToWaitList(
        payload.user_id,
        payload.event_id,
        transaction
      );
      await transaction.commit();

      return this.processResponse({
        statusCode: HTTP_STATUS_CODE.CREATED,
        message: 'User has joined the waiting list',
        data: waitingList,
      });
    } catch (error) {
      await transaction.rollback();
      console.error('TicketService[joinWaitingList]: ', error);
      throw error;
    }
  }
}
