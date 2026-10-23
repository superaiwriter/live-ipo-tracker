/**
 * Maps standard ISO currency codes to symbols. Defaults to '₹' for Indian rupee or provided symbol.
 */
export function getCurrencySymbol(currency?: string | null): string {
  if (!currency) return '₹';
  switch (currency.toUpperCase()) {
    case 'INR':
      return '₹';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'HKD':
      return 'HK$';
    case 'CAD':
      return 'CA$';
    case 'AUD':
      return 'A$';
    case 'JPY':
      return '¥';
    case 'KRW':
      return '₩';
    case 'SGD':
      return 'S$';
    default:
      return `${currency} `;
  }
}
