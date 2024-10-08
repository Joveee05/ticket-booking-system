import { DB } from '@/database';
import { Transaction } from 'sequelize';

export const addUserBooking = async (
  event_id: number,
  user_id: number,
  transaction: Transaction
) => {
  try {
    const [booking] = await Promise.all([
      DB.Bookings.create({ user_id, event_id }, { transaction }),
    ]);
    return booking;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to add user booking: ${error.message}`);
  }
};
