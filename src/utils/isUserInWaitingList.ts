import { DB } from '@/database';

export const isUserInWaitingList = async (
  user_id: number,
  event_id: number
): Promise<boolean> => {
  try {
    const existingEntry = await DB.WaitingLists.findOne({
      where: { user_id, event_id },
    });

    return !!existingEntry;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to check waiting list status: ${error.message}`);
  }
};
