export const formatRM = (amount: number | string): string => {
  const val = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(val)) return 'RM 0.00';
  return `RM ${val.toFixed(2)}`;
};
