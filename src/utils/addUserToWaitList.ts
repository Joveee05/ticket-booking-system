import { DB } from '@/database';
import { Transaction } from 'sequelize';

export const addUserToWaitList = async (
  user_id: number,
  event_id: number,
  transaction: Transaction
) => {
  try {
    const waitListing = await DB.WaitingLists.create(
      { user_id, event_id },
      { transaction }
    );
    return waitListing;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to add user to waiting list: ${error.message}`);
  }
};
