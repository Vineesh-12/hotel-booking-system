import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, addDays, differenceInDays, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, 'MMM dd, yyyy');
}

export function formatDateString(dateStr: string): string {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  if (!isValid(date)) return '';
  
  return format(date, 'MMM dd, yyyy');
}

export function formatDateRange(checkIn: string | Date, checkOut: string | Date): string {
  if (!checkIn || !checkOut) return '';
  
  const checkInDate = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const checkOutDate = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
  
  if (!isValid(checkInDate) || !isValid(checkOutDate)) return '';
  
  const nights = differenceInDays(checkOutDate, checkInDate);
  
  return `${format(checkInDate, 'MMM dd, yyyy')} - ${format(checkOutDate, 'MMM dd, yyyy')} (${nights} night${nights !== 1 ? 's' : ''})`;
}

export function generateReferenceNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK${timestamp}${random}`;
}

export function calculateTotalAmount(price: number, nights: number): {
  roomTotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
} {
  const roomTotal = price * nights;
  const cleaningFee = 30;
  const serviceFee = 25;
  const taxRate = 0.12;
  const taxes = (roomTotal + cleaningFee + serviceFee) * taxRate;
  const total = roomTotal + cleaningFee + serviceFee + taxes;
  
  return {
    roomTotal,
    cleaningFee,
    serviceFee,
    taxes,
    total
  };
}

export function getRoomTypeLabel(type: string): string {
  const types: Record<string, string> = {
    'standard': 'Standard',
    'deluxe': 'Deluxe',
    'suite': 'Suite',
    'executive': 'Executive',
  };
  
  return types[type] || type;
}

export function getAmenityLabel(amenity: string): { label: string; icon: string } {
  const amenities: Record<string, { label: string; icon: string }> = {
    'wifi': { label: 'Free WiFi', icon: 'wifi' },
    'breakfast': { label: 'Breakfast', icon: 'free_breakfast' },
    'ac': { label: 'AC', icon: 'ac_unit' },
    'tv': { label: 'Smart TV', icon: 'tv' },
    'pool': { label: 'Pool Access', icon: 'pool' },
    'spa': { label: 'Spa Access', icon: 'spa' },
    'minibar': { label: 'Minibar', icon: 'liquor' },
    'balcony': { label: 'Balcony', icon: 'deck' },
    'kitchen': { label: 'Kitchen', icon: 'kitchen' },
    'ocean-view': { label: 'Ocean View', icon: 'water' },
  };
  
  return amenities[amenity] || { label: amenity, icon: 'check' };
}

export function getBookingStatusLabel(status: string): { label: string; color: string } {
  const statuses: Record<string, { label: string; color: string }> = {
    'pending': { label: 'Pending', color: 'bg-yellow-500' },
    'confirmed': { label: 'Confirmed', color: 'bg-green-500' },
    'cancelled': { label: 'Cancelled', color: 'bg-red-500' },
    'completed': { label: 'Completed', color: 'bg-blue-500' },
  };
  
  return statuses[status] || { label: status, color: 'bg-gray-500' };
}

export function getPaymentStatusLabel(status: string): { label: string; color: string } {
  const statuses: Record<string, { label: string; color: string }> = {
    'pending': { label: 'Pending', color: 'bg-yellow-500' },
    'completed': { label: 'Completed', color: 'bg-green-500' },
    'failed': { label: 'Failed', color: 'bg-red-500' },
    'refunded': { label: 'Refunded', color: 'bg-blue-500' },
  };
  
  return statuses[status] || { label: status, color: 'bg-gray-500' };
}
