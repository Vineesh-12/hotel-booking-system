import { Room, Booking, User, Payment } from '@shared/schema';

export interface SearchParams {
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  roomType?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
}

export interface FilterParams {
  roomType: string;
  price: string;
  amenities: string;
}

export interface SortOption {
  option: string;
}

export interface BookingFormData {
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
}

export interface PaymentFormData {
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export interface CalendarDay {
  date: Date;
  isDisabled: boolean;
  isSelected: boolean;
  isInRange: boolean;
}

export interface RoomDateAvailability {
  isAvailable: boolean;
  dates: {
    date: string;
    isAvailable: boolean;
    price?: number;
    bookingId?: number;
  }[];
}

export interface PriceBreakdown {
  roomTotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
}

export interface BookingWithRoomDetails extends Booking {
  room?: Room;
}

export interface AuthState {
  user: {
    id: number;
    username: string;
    isAdmin: boolean;
  } | null;
  isLoading: boolean;
  error: string | null;
}
