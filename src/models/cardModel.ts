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
    enum: ['platinumtravel', 'mrcc', 'goldcharge', 'simplyclick', 'prime', 'elite', 'bpcloctane', 'cashback', 'clubvistaraprime', 'yatra', 'simplysave', 'irctcplatinum', 'altura', 'alturaplus', 'ixigo', 'lit', 'vetta', 'zenith', 'zenithplus', 'indianoilextra', 'irctc', 'icon', 'paisabazarduet', 'play', 'worldsafari', 'shoprite', 'adanione', 'amazonpay', 'emiratesskywards', 'hpclcoral', 'hpcl', 'sapphiro', 'coral', 'emeralde', 'hpclsupersaver', 'tataneu', '6erewards', '6erewardsxl', 'allmiles', 'easyemi', 'pixelplay', 'platinumedge', 'times', 'millenia', 'regalia', 'regaliafirst', 'infinia', 'dinersclub', 'clubvistara', 'ashva', 'mayura', 'millenia', 'onecard', 'powerplus'],
  },
  bankName: {
    type: String,
    required: [true, 'Please provide a bank name'],
    enum: ['amex', 'sbi', 'au', 'rbl', 'icici', 'hdfc', 'idfc'],
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