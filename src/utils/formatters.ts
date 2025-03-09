import { format } from 'date-fns';

// Format currency with proper symbol and decimal places
export const formatCurrency = (amount: number, currency: string = 'usd') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });
  
  return formatter.format(amount / 100);
};

// Format date string to a readable format
export const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'MMM d, yyyy HH:mm');
}; 