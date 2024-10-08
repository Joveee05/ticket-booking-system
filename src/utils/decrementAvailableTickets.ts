import { DB } from '@/database';
import { Transaction } from 'sequelize';

export const decrementAvailableTickets = async (
  event_id: number,
  quantity: number,
  transaction: Transaction
) => {
  try {
    await DB.Events.decrement('available_tickets', {
      by: quantity,
      where: { id: event_id },
      transaction,
    });
    return { success: true };
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to add user to waiting list: ${error.message}`);
  }
};
