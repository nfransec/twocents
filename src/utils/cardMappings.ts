export const cardToBankMapping = {
  'Infinia': 'HDFC Bank',
  'SimplyCLICK': 'SBI',
  'Magnus': 'Axis Bank',
  'Flipkart': 'Axis Bank',
  'Amazon Pay': 'ICICI Bank',
  'BookMyShow PLaY': 'RBL Bank',
  'MRCC': 'American Express',
  'Gold Charge': 'American Express',
  'Platinum Travel': 'American Express',
  'Tata Neu': 'HDFC Bank',
  'Ixigo': 'AU Bank',
  'Power Plus': 'IDFC Bank',
};

export type CardName = keyof typeof cardToBankMapping;

