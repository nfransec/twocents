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
  const [isAutoPayEnabled, setIsAutoPayEnabled] = useState(card.paymentSchedule?.isAutoPayEnabled || false)
  const [reminderDays, setReminderDays] = useState(card.paymentSchedule?.reminderDays || 5)

  const handleScheduleUpdate = async () => {
    try {
      const response = await axios.put(`/api/cards/${card._id}/schedule`, {
        paymentSchedule: {
          isAutoPayEnabled,
          reminderDays,
          reminderMethod: 'BOTH'
        }
      });

      if (response.data.success) {
        onUpdate(response.data.data);
        toast.success('Payment schedule updated successfully');
      }
    } catch (error) {
      console.error('Error updating payment schedule:', error);
      toast.error('Failed to update payment schedule');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm">Enable Auto-Pay</span>
        <Switch
          checked={isAutoPayEnabled}
          onCheckedChange={setIsAutoPayEnabled}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Reminder Days Before Due Date</label>
        <select
          value={reminderDays}
          onChange={(e) => setReminderDays(Number(e.target.value))}
          className="w-full p-2 rounded-md bg-slate-800 border border-slate-700"
        >
          {[1, 2, 3, 5, 7, 10].map((days) => (
            <option key={days} value={days}>{days} days</option>
          ))}
        </select>
      </div>

      <Button 
        onClick={handleScheduleUpdate}
        className="w-full bg-purple-700 hover:bg-purple-800"
      >
        Update Payment Schedule
      </Button>
    </div>
  )
} 