import { prisma } from '@/src/lib/prisma'
import { NotificationType } from '@prisma/client'

export async function sendNotification({
  userId,
  title,
  message,
  type,
  link,
}: {
  userId: string
  title: string
  message: string
  type: NotificationType | string
  link?: string
}) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type as NotificationType,
        link,
      },
    })
  } catch (error) {
    console.error('Failed to send notification:', error)
  }
}

export async function sendNotificationToMany({
  userIds,
  title,
  message,
  type,
  link,
}: {
  userIds: string[]
  title: string
  message: string
  type: NotificationType | string
  link?: string
}) {
  try {
    if (userIds.length === 0) return
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        title,
        message,
        type: type as NotificationType,
        link,
      })),
    })
  } catch (error) {
    console.error('Failed to send bulk notifications:', error)
  }
}
