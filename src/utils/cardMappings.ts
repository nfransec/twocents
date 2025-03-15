export type Bank = 
  | 'HDFC' 
  | 'ICICI' 
  | 'SBI' 
  | 'Axis'
  | 'Amex'
  | 'RBL'
  | 'IDFC'
  | 'AU Small Finance'
  | 'Standard Chartered';

export type CardName = 
  | 'Infinia' 
  | 'Diners Club Black' 
  | 'Regalia' 
  | 'Regalia Gold'
  | 'Millennia' 
  | 'Swiggy Card'
  | 'Tata Neu Infinity'
  | 'Tata Neu Plus'
  | 'IRCTC RuPay'
  | 'Shoppers Stop'
  | 'MoneyBack Plus'
  | 'Marriott Bonvoy'
  | 'Diners Club Privilege'
  | 'Shoppers Stop Black'
  | 'Freedom'
  | '6E Rewards XL - Indigo'
  | '6E Rewards - Indigo'
  | 'IndianOil'
  | 'UPI RuPay'
  | 'Pixel Play'
  | 'Pixel Go'
  | 'Harley Davidson Diners Club'
  | 'H.O.G Diners Club'
  | 'Regalia First'
  | 'Platinum Times'
  | 'Titanium Times'
  | 'All Miles'
  | 'Amazon Pay' 
  | 'SimplySAVE'
  | 'SimplyCLICK'
  | 'Atlas'
  | 'Magnus'
  | 'Olympus'   
  | 'Platinum Travel'
  | 'Gold Charge'
  | 'Platinum Charge'
  | 'MRCC'
  | 'PLaY'
  | 'Power Plus'
  | 'Ixigo'
  | 'Platinum Rewards'
  | 'Smart'
  | 'Rewards'
  | 'Ultimate';

export const bankToCardsMapping: Record<Bank, CardName[]> = {
  'HDFC': ['Infinia', 'Diners Club Black', 'Regalia', '6E Rewards - Indigo', '6E Rewards XL - Indigo', 'All Miles', 'Freedom', 'Regalia Gold', 'Millennia', 'Swiggy Card', 'Tata Neu Infinity', 'Tata Neu Plus', 'IRCTC RuPay', 'Shoppers Stop', 'MoneyBack Plus', 'Marriott Bonvoy', 'Diners Club Privilege', 'Shoppers Stop Black', 'IndianOil', 'UPI RuPay', 'Pixel Play', 'Pixel Go', 'Harley Davidson Diners Club', 'H.O.G Diners Club', 'Regalia First', 'Platinum Times', 'Titanium Times'],
  'ICICI': ['Amazon Pay'],
  'SBI': ['SimplySAVE', 'SimplyCLICK'],
  'Axis': ['Atlas', 'Magnus', 'Olympus'],
  'Amex': ['Platinum Travel', 'Gold Charge', 'Platinum Charge', 'MRCC'],
  'RBL': ['PLaY'],
  'IDFC': ['Power Plus'],
  'AU Small Finance': ['Ixigo'],
  'Standard Chartered': ['Platinum Rewards', 'Smart', 'Rewards', 'Ultimate']
};

export const cardToBankMapping: Record<CardName, Bank> = {
  'Infinia': 'HDFC',
  'Diners Club Black': 'HDFC',
  'Regalia': 'HDFC',
  'Regalia Gold': 'HDFC',
  'Millennia': 'HDFC',
  'Swiggy Card': 'HDFC',
  'Tata Neu Infinity': 'HDFC',
  'Tata Neu Plus': 'HDFC',
  'IRCTC RuPay': 'HDFC',
  'Shoppers Stop': 'HDFC',
  'MoneyBack Plus': 'HDFC',
  'Marriott Bonvoy': 'HDFC',
  'Diners Club Privilege': 'HDFC',
  'Shoppers Stop Black': 'HDFC',
  'Freedom': 'HDFC',
  '6E Rewards XL - Indigo': 'HDFC',
  '6E Rewards - Indigo': 'HDFC',
  'IndianOil': 'HDFC',
  'UPI RuPay': 'HDFC',
  'Pixel Play': 'HDFC',
  'Pixel Go': 'HDFC',
  'Harley Davidson Diners Club': 'HDFC',
  'H.O.G Diners Club': 'HDFC',
  'Regalia First': 'HDFC',
  'Platinum Times': 'HDFC',
  'Titanium Times': 'HDFC',
  'All Miles': 'HDFC',
  'Amazon Pay': 'ICICI',
  'SimplySAVE': 'SBI',
  'SimplyCLICK': 'SBI',
  'Atlas': 'Axis',
  'Magnus': 'Axis',
  'Olympus': 'Axis',
  'Platinum Travel': 'Amex',
  'Gold Charge': 'Amex',
  'Platinum Charge': 'Amex',
  'MRCC': 'Amex',
  'PLaY': 'RBL',
  'Power Plus': 'IDFC',
  'Ixigo': 'AU Small Finance',
  'Platinum Rewards': 'Standard Chartered',
  'Smart': 'Standard Chartered',
  'Rewards': 'Standard Chartered',
  'Ultimate': 'Standard Chartered'
};

