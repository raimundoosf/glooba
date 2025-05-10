'use server';

import prisma from '@/lib/prisma';
import { getDbUserId } from './user.action';

/**
 * Retrieves a list of notifications for the current user.
 *
 * The notifications are ordered in descending order by their creation time.
 *
 * If the user is not logged in, an empty array is returned.
 *
 * @returns {Promise<Array<Notification>>} - A promise that resolves to an array of notifications.
 * @throws {Error} - If there is a database error while fetching notifications.
 */
export async function getNotifications() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            image: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications;
  } catch (error) {

    throw new Error('Failed to fetch notifications');
  }
}

/**
 * Marks multiple notifications as read by updating the 'read' field to true.
 *
 * @param {string[]} notificationIds - An array of notification IDs to mark as read.
 * @returns {Promise<{ success: boolean }>} - A promise that resolves to an object
 * with a single property, 'success', which is true if the operation was successful
 * and false otherwise.
 */
export async function markNotificationsAsRead(notificationIds: string[]) {
  try {
    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  } catch (error) {

    return { success: false };
  }
}
