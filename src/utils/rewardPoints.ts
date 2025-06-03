// Reward point conversion rates (points per rupee)
const rewardRates: { [key: string]: number } = {
  'HDFC Regalia': 0.5, // 0.5 rupees per point
  'HDFC Infinia': 0.5,
  'Tata Neu': 1,
  'ICICI Amazon Pay': 0.4,
  'ICICI Sapphiro': 0.5,
  'ICICI Coral': 0.4,
  'SBI SimplyCLICK': 0.4,
  'SBI Elite': 0.5,
  'Axis Magnus': 0.5,
  'Atlas': 2,
  'Axis Vistara': 0.4,
  'Amex Platinum': 0.5,
  'Amex Gold': 0.4,
  'RBL Shoprite': 0.4,
  'IDFC First': 0.4,
  'AU Small Finance': 0.4,
  'Standard Chartered': 0.4,
};

export const calculateRewardValue = (cardName: string, points: number): number => {
  const rate = rewardRates[cardName] || 0.4; // Default to 0.4 if card not found
  return Math.round(points * rate);
}; 