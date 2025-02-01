import { CardType } from '@/types/card'
import { sendEmail } from '@/lib/email'
import { sendPushNotification } from '@/lib/pushNotification'
import cron from 'node-cron'
import nodemailer from 'nodemailer'

export async function schedulePaymentReminder(card: CardType) {
  const dueDate = new Date(card.billingDate)
  const reminderDate = new Date(dueDate)
  reminderDate.setDate(dueDate.getDate() - (card.paymentSchedule?.reminderDays || 5))

  // Schedule reminder using your preferred scheduling library
  // Example using node-schedule:
  const schedule = require('node-schedule')
  
  schedule.scheduleJob(reminderDate, async () => {
    if (card.paymentSchedule?.reminderMethod?.includes('EMAIL')) {
      await sendEmail({
        to: card.userId.email,
        subject: `Payment Reminder: ${card.cardName}`,
        text: `Your payment of ₹${card.outstandingAmount} for ${card.cardName} is due on ${dueDate.toLocaleDateString()}`
      })
    }

    if (card.paymentSchedule?.reminderMethod?.includes('PUSH')) {
      await sendPushNotification({
        userId: card.userId._id,
        title: `Payment Reminder: ${card.cardName}`,
        body: `Payment of ₹${card.outstandingAmount} is due on ${dueDate.toLocaleDateString()}`
      })
    }
  })
} 