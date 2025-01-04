/**
 * Converts a numeric value to a formatted currency string in Lempiras (Honduran currency).
 * 
 * @param value - The numeric value to be formatted as currency.
 * @returns The formatted currency string.
 */
export const currencyFormatToLempiras = (value: string) => {
  return parseFloat(value).toLocaleString("es-HN", {
    style: "currency",
    currency: "HNL",
  })
};

export const formatCurrency = (value: number) => {
  return value.toLocaleString('es-HN', {
    style: 'currency',
    currency: 'HNL'
  });
}