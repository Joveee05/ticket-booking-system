import { Request, Response, NextFunction } from 'express';
import { DB } from '@/database';
import { HttpException } from '@/exceptions/HttpException';
import { addUserBooking } from '@/utils/addUserBooking';
import { decrementAvailableTickets } from '@/utils/decrementAvailableTickets';
import { isUserInWaitingList } from '@/utils/isUserInWaitingList';
import { addUserToWaitList } from '@/utils/addUserToWaitList';
import { HTTP_STATUS_CODE } from '@/types/custom.types';

export const checkIfBooked = (forCancellation: boolean = false) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { user_id, event_id } = req.body;

    try {
      const existingBooking = await DB.Bookings.findOne({
        where: { user_id: user_id, event_id: event_id },
      });

      if (!forCancellation && existingBooking) {
        return next(
          new HttpException(
            HTTP_STATUS_CODE.BAD_REQUEST,
            'Booking already exists. This user has already booked for this event'
          )
        );
      }

      if (forCancellation && !existingBooking) {
        return next(
          new HttpException(
            HTTP_STATUS_CODE.BAD_REQUEST,
            'The booking you are trying to cancel does not exist or has already been cancelled'
          )
        );
      }

      next();
    } catch (error) {
      return next(error);
    }
  };
};

export const checkAvailableTickets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user_id, event_id, quantity, additionalUsers = [] } = req.body;

  const transaction = await DB.sequelize.transaction();

  try {
    const event = await DB.Events.findByPk(event_id);

    if (!event) {
      return next(
        new HttpException(
          HTTP_STATUS_CODE.NOT_FOUND,
          `Event with ID ${event_id} not found.`
        )
      );
    }

    const totalUsers = 1 + additionalUsers.length;
    const bookedUsers = [];
    const waitlistedUsers = [];

    // If there are enough tickets, proceed to the next middleware or controller
    if (event.available_tickets >= totalUsers) {
      return next();
    }

    if (event.available_tickets <= 0) {
      const alreadyInWaitlist = await isUserInWaitingList(user_id, event_id);

      if (!alreadyInWaitlist) {
        await addUserToWaitList(user_id, event_id, transaction);
        waitlistedUsers.push(user_id);
      }

      for (const additionalUserId of additionalUsers) {
        const alreadyInWaitlist = await isUserInWaitingList(
          additionalUserId,
          event_id
        );
        if (!alreadyInWaitlist) {
          await addUserToWaitList(additionalUserId, event_id, transaction);
          waitlistedUsers.push(additionalUserId);
        }
      }

      await transaction.commit();
      return res.status(200).json({
        statusCode: HTTP_STATUS_CODE.OK,
        message:
          'No tickets available. All users have been added to the waiting list.',
        data: { waitlistedUsers },
      });
    }

    // If there are not enough tickets, book what is available and add the rest to the waitlist
    const availableTickets = event.available_tickets;
    let usersToBook = Math.min(availableTickets, additionalUsers.length + 1); // +1 to include the main user

    // Book for the main user
    if (availableTickets > 0) {
      const booking = await addUserBooking(event_id, user_id, transaction);
      bookedUsers.push(user_id);
      usersToBook--;
    } else {
      waitlistedUsers.push(user_id);
    }

    // Book tickets for additional users based on available tickets
    for (let i = 0; i < additionalUsers.length; i++) {
      const additionalUserId = additionalUsers[i];

      if (bookedUsers.length < availableTickets) {
        const booking = await addUserBooking(
          event_id,
          additionalUserId,
          transaction
        );
        bookedUsers.push(additionalUserId);
        usersToBook--;
      } else {
        const alreadyInWaitlist = await isUserInWaitingList(
          additionalUserId,
          event_id
        );

        if (!alreadyInWaitlist) {
          await addUserToWaitList(additionalUserId, event_id, transaction);
          waitlistedUsers.push(additionalUserId);
        }
      }
    }

    // Add the main user to the waitlist if not booked
    if (!bookedUsers.includes(user_id)) {
      const alreadyInWaitlist = await isUserInWaitingList(user_id, event_id);

      if (!alreadyInWaitlist) {
        await addUserToWaitList(user_id, event_id, transaction);
        waitlistedUsers.push(user_id);
      }
    }

    const quantity = bookedUsers.length;
    if (bookedUsers.length > 0) {
      await decrementAvailableTickets(event_id, quantity, transaction);
    }

    await transaction.commit();

    return res.status(200).json({
      statusCode: HTTP_STATUS_CODE.OK,
      message:
        'Partial booking processed. Some users were added to the waitlist.',
      data: { bookedUsers, waitlistedUsers },
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
};
