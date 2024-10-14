import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cardName: {
    type: String,
    required: [true, 'Please provide a card name'],
    enum: ["Platinum Travel", 'SimplyCLICK', 'Ixigo', 'BookMyShow PLaY', 'Amazon Pay', 'Gold Charge', 'Infinia', 'MRCC', 'Tata Neu', 'Power +', 'Scapia'],
  },
  bankName: {
    type: String,
    required: [true, 'Please provide a bank name'],
    enum: ['Amex', 'SBI', 'AU', 'RBL', 'ICICI', 'HDFC', 'IDFC', 'Federal'],
  },
  cardLimit: {
    type: Number,
    required: [true, 'Please provide a card limit'],
  },
  billingDate: {
    type: Date,
    required: [true, 'Please provide a billing date'],
  },
  outstandingAmount: {
    type: Number,
    default: 0,
  },
  imageUrl: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Card = mongoose.models.cards || mongoose.model('cards', cardSchema);

export default Card;