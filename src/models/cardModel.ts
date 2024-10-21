import mongoose from "mongoose";
import { cardToBankMapping } from '@/utils/cardMappings';

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cardName: {
    type: String,
    enum: Object.keys(cardToBankMapping),
    required: true,
  },
  bankName: {
    type: String,
    enum: Object.values(cardToBankMapping),
    required: true,
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
    default: 0,
  },
  imageUrl: {
    type: String,
  },
}, { timestamps: true });

const Card = mongoose.models.Card || mongoose.model('Card', cardSchema);

export default Card;
