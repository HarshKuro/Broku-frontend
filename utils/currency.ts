/**
 * Formats a number as Indian Rupees (INR) currency
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the ₹ symbol (default: true)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, showSymbol: boolean = true): string => {
  const formattedAmount = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return showSymbol ? `₹${formattedAmount}` : formattedAmount;
};

/**
 * Formats a number as compact Indian Rupees (e.g., ₹1.2K, ₹1.5L)
 * @param amount - The amount to format
 * @returns Compact formatted currency string
 */
export const formatCurrencyCompact = (amount: number): string => {
  if (amount >= 10000000) { // 1 Crore
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) { // 1 Lakh
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) { // 1 Thousand
    return `₹${(amount / 1000).toFixed(1)}K`;
  } else {
    return formatCurrency(amount);
  }
};

/**
 * Parses a currency string and returns the numeric value
 * @param currencyString - String like "₹1,234.56" or "1234.56"
 * @returns Numeric value
 */
export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbol and commas, then parse
  const cleanString = currencyString.replace(/[₹,]/g, '');
  return parseFloat(cleanString) || 0;
};

/**
 * Validates if a string is a valid currency amount
 * @param value - String to validate
 * @returns boolean indicating if valid
 */
export const isValidCurrencyAmount = (value: string): boolean => {
  const cleanValue = value.replace(/[₹,]/g, '');
  const numberValue = parseFloat(cleanValue);
  return !isNaN(numberValue) && numberValue >= 0;
};