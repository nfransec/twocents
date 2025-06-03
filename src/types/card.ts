export interface CardType {
  _id: string;
  cardName: string;
  bankName: string;
  cardLimit: number;
  billingDate: string;
  outstandingAmount: number;
  isPaid: boolean;
  currentPaidAmount: number;
  lastPaymentDate?: string;
  paymentHistory: {
    amount: number;
    date: string;
    billingMonth: string;
    outstandingAfterPayment: number;
  }[];
  paymentSchedule: {
    isAutoPayEnabled: boolean;
    reminderDays: number;
    reminderMethod: string;
  };
  imageUrl?: string;
  cardNumber?: string;
  cvv?: string;
  lastPaymentAmount?: number;
  rewardPoints: number;
  rewardValue: number;
}

export interface PaymentHistoryType {
  amount: number;
  date: string;
  billingMonth: string;
  outstandingAfterPayment: number;
} 