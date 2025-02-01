'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { CardType } from '@/types/card'
import { toast } from 'sonner'
import axios from 'axios'

interface PaymentSchedulerProps {
  card: CardType;
  onUpdate: (updatedCard: CardType) => void;
}

export function PaymentScheduler({ card, onUpdate }: PaymentSchedulerProps) {
  const [isAutoPayEnabled, setIsAutoPayEnabled] = useState(false)
  const [reminderDays, setReminderDays] = useState(5)

  const handleScheduleUpdate = async () => {
    try {
      const response = await axios.put(`/api/cards/${card._id}`, {
        ...card,
        paymentSchedule: {
          isAutoPayEnabled,
          reminderDays,
          reminderMethod: 'BOTH'
        }
      })

      if (response.data.success) {
        onUpdate(response.data.data)
        toast.success('Payment schedule updated')
      }
    } catch (error) {
      console.error('Error updating payment schedule:', error)
      toast.error('Failed to update payment schedule')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span>Auto-pay</span>
        <Switch
          checked={isAutoPayEnabled}
          onCheckedChange={setIsAutoPayEnabled}
        />
      </div>
      <div className="flex items-center justify-between">
        <span>Reminder days before due</span>
        <input
          type="number"
          value={reminderDays}
          onChange={(e) => setReminderDays(Number(e.target.value))}
          className="w-16 p-1 text-black rounded border"
          min={1}
          max={30}
        />
      </div>
      <Button onClick={handleScheduleUpdate} className="w-full">
        Update Schedule
      </Button>
    </div>
  )
} 