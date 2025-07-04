// Utility functions for currency formatting and symbols

export const getCurrencySymbol = (currency: string): string => {
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'CNY': '¥',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'RUB': '₽',
    'BRL': 'R$',
    'INR': '₹',
    'KRW': '₩',
    'SGD': 'S$',
    'HKD': 'HK$',
    'NZD': 'NZ$',
    'MXN': '$',
    'ZAR': 'R',
    'TRY': '₺',
    'ILS': '₪',
    'THB': '฿',
    'MYR': 'RM',
    'PHP': '₱',
    'IDR': 'Rp',
    'VND': '₫',
    'BTC': '₿',
    'ETH': 'Ξ'
  };

  return currencySymbols[currency.toUpperCase()] || currency.toUpperCase();
};

export const formatCurrency = (amount: number, currency: string): string => {
  const symbol = getCurrencySymbol(currency);
  
  // For some currencies, the symbol goes after the amount
  const symbolAfterAmount = ['SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF'];
  
  if (symbolAfterAmount.includes(currency.toUpperCase())) {
    return `${amount.toLocaleString()} ${symbol}`;
  }
  
  return `${symbol}${amount.toLocaleString()}`;
};