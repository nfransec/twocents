export interface CardType {
  _id: string;
  cardName: string;
  bankName: string;
  cardLimit: number;
  billingDate: string;
  outstandingAmount: number;
  cardNumber?: string;
  cvv?: string;
  paymentDate?: string;
  paidAmount?: number;
  isPaid: boolean;
  paymentHistory?: {
    amount: number;
    date: string;
    billingMonth: string;
    outstandingAfterPayment: number;
  }[];
  lastPaymentAmount?: number;
  lastPaymentDate?: string;
  userId?: string;
}

export interface PaymentHistoryType {
  amount: number;
  date: string;
  billingMonth: string;
  outstandingAfterPayment: number;
} 