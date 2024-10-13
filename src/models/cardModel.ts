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
  },
  bankName: {
    type: String,
    required: [true, 'Please provide a bank name'],
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
}, { timestamps: true });

const Card = mongoose.models.cards || mongoose.model('cards', cardSchema);

export default Card;