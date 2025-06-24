'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function updateSubscriptionExpiry(subscriptionId: string, newExpiryDate: Date) {
  try {
    await db.userPurchasedServices.update({
      where: {
        id: subscriptionId
      },
      data: {
        expiryDate: newExpiryDate
      }
    })

    revalidatePath('/admin')
    return { success: true, message: 'Subscription expiry updated successfully' }
  } catch (error) {
    console.error('Error updating subscription expiry:', error)
    return { success: false, message: 'Failed to update subscription expiry' }
  }
}

export async function extendSubscriptionByDays(subscriptionId: string, days: number) {
  try {
    const subscription = await db.userPurchasedServices.findUnique({
      where: { id: subscriptionId }
    })

    if (!subscription) {
      return { success: false, message: 'Subscription not found' }
    }

    const currentExpiry = new Date(subscription.expiryDate)
    const newExpiry = new Date(currentExpiry.getTime() + (days * 24 * 60 * 60 * 1000))

    await db.userPurchasedServices.update({
      where: { id: subscriptionId },
      data: { expiryDate: newExpiry }
    })

    revalidatePath('/admin')
    return { success: true, message: `Subscription extended by ${days} days` }
  } catch (error) {
    console.error('Error extending subscription:', error)
    return { success: false, message: 'Failed to extend subscription' }
  }
}

export async function toggleSubscriptionStatus(subscriptionId: string, isActive: boolean) {
  try {

    const subscription = await db.userPurchasedServices.findUnique({
      where: { id: subscriptionId },
      include: {
        user: { select: { name: true, email: true } },
        service: { select: { name: true } }
      }
    })

    if (!subscription) {
      return { success: false, message: 'Subscription not found' }
    }

    await db.userPurchasedServices.update({
      where: { id: subscriptionId },
      data: { isActive }
    })

    return { 
      success: true, 
      message: `Subscription ${isActive ? 'activated' : 'deactivated'} successfully` 
    }
  } catch (error) {
    console.error('Error toggling subscription status:', error)
    return { success: false, message: 'Failed to update subscription status' }
  }
}