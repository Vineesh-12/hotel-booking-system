import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatCurrency, formatDateRange, getBookingStatusLabel } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useBooking } from '@/hooks/useBooking';
import { Booking } from '@shared/schema';

export default function MyBookings() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { useMyBookings, useCancelBooking } = useBooking();
  const { data: bookings, isLoading: bookingsLoading } = useMyBookings();
  const cancelBooking = useCancelBooking();
  
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  
  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    setLocation('/login?redirect=/my-bookings');
    return null;
  }
  
  const handleCancelBooking = async () => {
    if (bookingToCancel) {
      try {
        await cancelBooking.mutateAsync(bookingToCancel.id);
        setBookingToCancel(null);
      } catch (error) {
        console.error('Failed to cancel booking:', error);
      }
    }
  };
  
  const isLoading = authLoading || bookingsLoading;
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-slab font-semibold mb-8">My Bookings</h1>
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!bookings || bookings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-slab font-semibold mb-8">My Bookings</h1>
        <Card className="text-center py-12">
          <CardContent>
            <div className="mb-4">
              <span className="material-icons text-gray-400 text-5xl">hotel</span>
            </div>
            <h2 className="text-xl font-medium mb-2">No bookings found</h2>
            <p className="text-gray-500 mb-6">
              You haven't made any bookings yet. Start by browsing our rooms.
            </p>
            <Link href="/rooms">
              <Button>Browse Rooms</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-slab font-semibold mb-8">My Bookings</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {bookings.map((booking) => {
          const { label: statusLabel, color: statusColor } = getBookingStatusLabel(booking.status);
          
          return (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 md:w-2/3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold mb-1">
                          Room #{booking.roomId}
                        </h2>
                        <div className="text-sm text-gray-500 mb-2">
                          Booking Reference: {booking.referenceNumber}
                        </div>
                      </div>
                      <Badge className={statusColor + " text-white"}>
                        {statusLabel}
                      </Badge>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center">
                        <span className="material-icons text-gray-500 mr-2">calendar_today</span>
                        <span>{formatDateRange(booking.checkInDate, booking.checkOutDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="material-icons text-gray-500 mr-2">person</span>
                        <span>{booking.guestCount} Guests</span>
                      </div>
                      <div className="flex items-center">
                        <span className="material-icons text-gray-500 mr-2">receipt</span>
                        <span>Total: {formatCurrency(booking.totalAmount)}</span>
                      </div>
                    </div>
                    
                    {booking.specialRequests && (
                      <div className="mt-4 bg-gray-50 p-3 rounded-md">
                        <div className="font-medium">Special Requests:</div>
                        <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-6 md:w-1/3">
                    <h3 className="font-medium mb-4">Actions</h3>
                    <div className="space-y-3">
                      <Link href={`/booking/${booking.referenceNumber}`}>
                        <Button variant="outline" className="w-full">
                          <span className="material-icons mr-2">visibility</span>
                          View Details
                        </Button>
                      </Link>
                      
                      {booking.status === 'pending' || booking.status === 'confirmed' ? (
                        <Button 
                          variant="outline" 
                          className="w-full border-red-500 text-red-500 hover:bg-red-50"
                          onClick={() => setBookingToCancel(booking)}
                        >
                          <span className="material-icons mr-2">cancel</span>
                          Cancel Booking
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Cancel Booking Confirmation Dialog */}
      <AlertDialog open={!!bookingToCancel} onOpenChange={() => setBookingToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your booking? 
              {bookingToCancel?.status === 'confirmed' && (
                <span className="block mt-2 font-medium text-red-500">
                  This action may be subject to cancellation fees according to our policy.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Booking</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelBooking}
              className="bg-red-500 hover:bg-red-600"
            >
              Yes, Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
