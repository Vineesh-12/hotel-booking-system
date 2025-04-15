import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Booking, Room, Payment } from '@shared/schema';
import { BookingFormData, PaymentFormData } from '@/lib/types';
import { generateReferenceNumber } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { differenceInDays } from 'date-fns';

export function useBooking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch bookings for the logged-in user
  const useMyBookings = () => {
    return useQuery<Booking[]>({
      queryKey: ['/api/my-bookings'],
      enabled: !!user,
    });
  };

  // Fetch a single booking by ID
  const useBooking = (id: number | null) => {
    return useQuery<Booking>({
      queryKey: ['/api/bookings', id],
      enabled: !!id,
    });
  };

  // Fetch a booking by reference number
  const useBookingByReference = (reference: string | null) => {
    return useQuery<Booking>({
      queryKey: ['/api/bookings/reference', reference],
      enabled: !!reference,
      queryFn: async () => {
        if (!reference) throw new Error('Reference number is required');
        const res = await fetch(`/api/bookings/reference/${reference}`);
        if (!res.ok) throw new Error('Failed to fetch booking');
        return res.json();
      },
    });
  };

  // Create a new booking
  const useCreateBooking = () => {
    return useMutation({
      mutationFn: async ({
        bookingData,
        room,
      }: {
        bookingData: BookingFormData;
        room: Room;
      }) => {
        const checkInDate = new Date(bookingData.checkIn);
        const checkOutDate = new Date(bookingData.checkOut);
        const nights = differenceInDays(checkOutDate, checkInDate);
        
        // Calculate total amount
        const cleaningFee = 30;
        const serviceFee = 25;
        const roomTotal = room.price * nights;
        const taxRate = 0.12;
        const taxes = (roomTotal + cleaningFee + serviceFee) * taxRate;
        const totalAmount = roomTotal + cleaningFee + serviceFee + taxes;
        
        const booking = {
          roomId: room.id,
          checkInDate: bookingData.checkIn,
          checkOutDate: bookingData.checkOut,
          guestCount: bookingData.guests,
          guestName: bookingData.guestName,
          guestEmail: bookingData.guestEmail,
          guestPhone: bookingData.guestPhone,
          specialRequests: bookingData.specialRequests,
          status: 'pending',
          totalAmount: totalAmount,
          referenceNumber: generateReferenceNumber(),
        };
        
        const res = await apiRequest('POST', '/api/bookings', booking);
        return res.json();
      },
      onSuccess: () => {
        if (user) {
          queryClient.invalidateQueries({ queryKey: ['/api/my-bookings'] });
        }
      },
    });
  };

  // Cancel a booking
  const useCancelBooking = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const res = await apiRequest('POST', `/api/bookings/${id}/cancel`, {});
        return res.json();
      },
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ['/api/my-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bookings', id] });
      },
    });
  };

  // Process payment for a booking
  const useProcessPayment = () => {
    return useMutation({
      mutationFn: async ({
        bookingId,
        paymentData,
        amount,
      }: {
        bookingId: number;
        paymentData: PaymentFormData;
        amount: number;
      }) => {
        // In a real app, this would call a payment gateway
        // For now, we'll simulate successful payment
        const payment = {
          bookingId,
          amount,
          status: 'completed',
          paymentMethod: 'credit_card',
          transactionId: `TRX${Date.now()}`,
        };
        
        const res = await apiRequest('POST', '/api/payments', payment);
        return res.json();
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['/api/bookings', variables.bookingId] });
        queryClient.invalidateQueries({ queryKey: ['/api/my-bookings'] });
      },
    });
  };

  // Admin: Fetch all bookings
  const useAllBookings = () => {
    return useQuery<Booking[]>({
      queryKey: ['/api/admin/bookings'],
      enabled: user?.isAdmin === true,
    });
  };

  // Admin: Update booking status
  const useUpdateBooking = () => {
    return useMutation({
      mutationFn: async ({ id, ...data }: Partial<Booking> & { id: number }) => {
        const res = await apiRequest('PUT', `/api/admin/bookings/${id}`, data);
        return res.json();
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
        queryClient.invalidateQueries({ queryKey: ['/api/bookings', variables.id] });
      },
    });
  };

  // Get payment history for a booking
  const usePaymentHistory = (bookingId: number | null) => {
    return useQuery<Payment[]>({
      queryKey: ['/api/payments/booking', bookingId],
      enabled: !!bookingId && !!user,
      queryFn: async () => {
        if (!bookingId) return [];
        const res = await fetch(`/api/payments/booking/${bookingId}`);
        if (!res.ok) throw new Error('Failed to fetch payment history');
        return res.json();
      },
    });
  };

  return {
    useMyBookings,
    useBooking,
    useBookingByReference,
    useCreateBooking,
    useCancelBooking,
    useProcessPayment,
    useAllBookings,
    useUpdateBooking,
    usePaymentHistory,
  };
}
