/**
 * Utility functions for Pink Luxury Charm & Jewelry
 */

/**
 * Formats a number into clean Indonesian Rupiah (IDR) currency format.
 * Example: 1850000 -> Rp 1.850.000
 */
export const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
