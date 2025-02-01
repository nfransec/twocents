export const cardToBankMapping: Record<CardName, string> = {
  'HDFC Regalia': 'HDFC',
  'HDFC Diners Black': 'HDFC',
  'Axis Magnus': 'Axis',
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
  'IDFC First Select': 'IDFC',
  'IDFC First Classic': 'IDFC',
  'AU Small Finance LIT': 'AU Small Finance',
  'AU Small Finance Height': 'AU Small Finance'
};

export type CardName = 
  | 'HDFC Regalia'
  | 'HDFC Diners Black'
  | 'Axis Magnus'
  | 'IDFC First Select'
  | 'IDFC First Classic'
  | 'AU Small Finance LIT'
  | 'AU Small Finance Height'
  | 'Infinia'
  | 'Atlas'
  | 'SimplyCLICK'
  | 'Magnus'
  | 'Flipkart'
  | 'Amazon Pay'
  | 'BookMyShow PLaY'
  | 'MRCC'
  | 'Gold Charge'
  | 'Platinum Travel'
  | 'Tata Neu'
  | 'Ixigo'
  | 'Power Plus';

