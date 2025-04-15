import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { useBooking } from '@/hooks/useBooking';
import { formatCurrency, formatDateRange } from '@/lib/utils';

interface BookingConfirmationProps {
  bookingReference: string;
  onClose: () => void;
}

export function BookingConfirmation({ bookingReference, onClose }: BookingConfirmationProps) {
  const [, setLocation] = useLocation();
  const { useBookingByReference } = useBooking();
  const { data: booking, isLoading } = useBookingByReference(bookingReference);
  
  const viewBookingDetails = () => {
    setLocation(`/booking/${bookingReference}`);
    onClose();
  };
  
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading booking details...</p>
      </div>
    );
  }
  
  if (!booking) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-icons text-white text-3xl">error</span>
        </div>
        <h2 className="text-2xl font-slab font-medium mb-2">Booking Not Found</h2>
        <p className="text-gray-600 mb-4">
          We couldn't find the booking with reference {bookingReference}.
        </p>
        <Button onClick={onClose}>Close</Button>
      </div>
    );
  }
  
  return (
    <div className="p-6 text-center">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="material-icons text-white text-3xl">check</span>
      </div>
      
      <h2 className="text-2xl font-slab font-medium mb-2">Booking Confirmed!</h2>
      <p className="text-gray-600 mb-4">
        Your reservation has been successfully confirmed. A confirmation email has been sent to your email address.
      </p>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6 text-left">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Booking Reference:</span>
          <span className="font-semibold">{booking.referenceNumber}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Room:</span>
          <span className="font-semibold">Room #{booking.roomId}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Dates:</span>
          <span className="font-semibold">{formatDateRange(booking.checkInDate, booking.checkOutDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Amount:</span>
          <span className="font-semibold">{formatCurrency(booking.totalAmount)}</span>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Button 
          onClick={viewBookingDetails}
          className="flex-1 bg-primary hover:bg-primary-dark text-white flex items-center justify-center"
        >
          <span className="material-icons mr-2">receipt</span>
          View Details
        </Button>
        <Button 
          onClick={onClose}
          variant="outline"
          className="flex-1 border border-gray-300 hover:bg-gray-50 flex items-center justify-center"
        >
          <span className="material-icons mr-2">home</span>
          Return to Home
        </Button>
      </div>
    </div>
  );
}
