export const cardToBankMapping = {
  'Infinia': 'HDFC',
  'Atlas': 'Axis',
  'SimplyCLICK': 'SBI',
  'Magnus': 'Axis',
  'Flipkart': 'Axis',
  'Amazon Pay': 'ICICI',
  'BookMyShow PLaY': 'RBL',
  'MRCC': 'American Express',
  'Gold Charge': 'American Express',
  'Platinum Travel': 'American Express',
  'Tata Neu': 'HDFC',
  'Ixigo': 'AU Small Finance',
  'Power Plus': 'IDFC',
};

export type CardName = keyof typeof cardToBankMapping;

