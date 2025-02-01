import mongoose, { Document } from 'mongoose';
import { cardToBankMapping } from '@/utils/cardMappings';

// Define interfaces for TypeScript
interface IPaymentHistory {
  amount: number;
  date: Date;
  outstandingAfterPayment: number;
  note?: string;
}

interface ICard extends Document {
  userId: mongoose.Types.ObjectId;
  cardName: string;
  bankName: string;
  cardLimit: number;
  billingDate: Date;
  outstandingAmount: number;
  cardNumber?: string;
  cvv?: string;
  isPaid: boolean;
  currentPaidAmount: number;
  lastPaymentDate?: Date;
  paymentHistory: IPaymentHistory[];
  paymentSchedule: {
    isAutoPayEnabled: boolean;
    reminderDays: number;
    reminderMethod: string;
  };
  imageUrl?: string;
  addPayment(amount: number, note?: string): Promise<ICard>;
}

const paymentHistorySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  outstandingAfterPayment: {
    type: Number,
    required: true
  },
  note: String
}, { timestamps: true });

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardName: {
    type: String,
    enum: Object.keys(cardToBankMapping),
    required: true,
  },
  bankName: {
    type: String,
    required: true,
    enum: ['HDFC', 'Axis', 'ICICI', 'SBI', 'IDFC', 'AU Small Finance']
  },
  cardLimit: {
    type: Number,
    required: true,
  },
  billingDate: {
    type: Date,
    required: true,
  },
  outstandingAmount: {
    type: Number,
    required: true,
  },
  isPaid: { type: Boolean, default: false },
  currentPaidAmount: { type: Number, default: 0 },
  lastPaymentDate: Date,
  paymentHistory: [{
    amount: Number,
    date: Date,
    billingMonth: String, // e.g., "2024-03"
    outstandingAfterPayment: Number
  }],
  paymentSchedule: {
    isAutoPayEnabled: { type: Boolean, default: false },
    reminderDays: { type: Number, default: 5 }, // Days before due date
    reminderMethod: { type: String, enum: ['EMAIL', 'PUSH', 'BOTH'], default: 'BOTH' }
  },
  imageUrl: {
    type: String,
  },
  cardNumber: { type: String },
  cvv: { type: String },
  lastPaymentAmount: Number,
}, { timestamps: true });

// Define the method on the schema
cardSchema.methods.addPayment = async function(amount: number, note?: string) {
  const payment = {
    amount,
    date: new Date(),
    outstandingAfterPayment: this.outstandingAmount - amount,
    note
  };
  
  this.paymentHistory.push(payment);
  this.currentPaidAmount = amount;
  this.lastPaymentDate = new Date();
  this.outstandingAmount -= amount;
  this.isPaid = this.outstandingAmount <= 0;
  
  return await this.save();
};

// Delete existing model if it exists
if (mongoose.models.Card) {
  delete mongoose.models.Card;
}

const Card = mongoose.model<ICard>('Card', cardSchema);
export default Card;
