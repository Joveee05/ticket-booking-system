import { DB } from '@/database';
import { Transaction } from 'sequelize';

export default async function bookTicketForNextInLineUser(
  nextInLine: { user_id: number; id: number },
  eventId: number,
  transaction: Transaction
) {
  try {
    const [booking] = await Promise.all([
      DB.Bookings.create(
        { user_id: nextInLine.user_id, event_id: eventId },
        { transaction }
      ),
      await DB.Events.decrement('available_tickets', {
        by: 1,
        where: { id: eventId },
        transaction,
      }),
      DB.WaitingLists.destroy({
        where: { id: nextInLine.id },
        transaction,
      }),
    ]);

    return booking;
  } catch (error) {
    throw new Error(
      `Failed to book ticket for next user in line: ${error.message}`
    );
  }
}
