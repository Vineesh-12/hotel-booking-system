import { useState } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Separator } from '@/components/ui/separator';
import { useBooking } from '@/hooks/useBooking';
import { useRooms } from '@/hooks/useRooms';
import { formatCurrency, formatDateRange, getBookingStatusLabel } from '@/lib/utils';

export default function BookingDetail() {
  const { reference } = useParams();
  const [, setLocation] = useLocation();
  const { useBookingByReference, useCancelBooking } = useBooking();
  const { data: booking, isLoading, error } = useBookingByReference(reference);
  const cancelBooking = useCancelBooking();
  
  const { useRoom } = useRooms();
  const { data: room } = useRoom(booking?.roomId);
  
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const handleCancelBooking = async () => {
    if (booking) {
      try {
        await cancelBooking.mutateAsync(booking.id);
        setShowCancelDialog(false);
      } catch (error) {
        console.error('Failed to cancel booking:', error);
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mb-6">
          <span className="material-icons text-red-500 text-6xl">error</span>
        </div>
        <h2 className="text-2xl font-semibold mb-4">Booking Not Found</h2>
        <p className="text-gray-600 mb-8">
          We couldn't find a booking with reference number: {reference}
        </p>
        <Link href="/my-bookings">
          <Button>View My Bookings</Button>
        </Link>
      </div>
    );
  }
  
  const { label: statusLabel, color: statusColor } = getBookingStatusLabel(booking.status);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/my-bookings">
          <Button variant="ghost" className="mb-2">
            <span className="material-icons mr-1">arrow_back</span> Back to My Bookings
          </Button>
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-slab font-semibold">Booking Details</h1>
          <Badge className={statusColor + " text-white"}>{statusLabel}</Badge>
        </div>
        <p className="text-gray-500">Reference: {booking.referenceNumber}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Booking Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Reservation Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <div>
                  <div className="text-sm text-gray-500">Room</div>
                  <div className="font-medium">{room?.name || `Room #${booking.roomId}`}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Booking Date</div>
                  <div className="font-medium">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Check-in</div>
                  <div className="font-medium">
                    {new Date(booking.checkInDate).toLocaleDateString()} (From 3:00 PM)
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Check-out</div>
                  <div className="font-medium">
                    {new Date(booking.checkOutDate).toLocaleDateString()} (Until 11:00 AM)
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Guests</div>
                  <div className="font-medium">{booking.guestCount} guests</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Amount</div>
                  <div className="font-medium">{formatCurrency(booking.totalAmount)}</div>
                </div>
              </div>
              
              {booking.specialRequests && (
                <div className="mt-6">
                  <div className="text-sm text-gray-500 mb-1">Special Requests</div>
                  <div className="bg-gray-50 p-3 rounded-md text-gray-700">
                    {booking.specialRequests}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Guest Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Guest Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium">{booking.guestName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{booking.guestEmail}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium">{booking.guestPhone}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Room Details */}
          {room && (
            <Card>
              <CardHeader>
                <CardTitle>Room Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 mb-4 md:mb-0 md:mr-4">
                    <img 
                      src={room.imageUrl} 
                      alt={room.name} 
                      className="w-full h-auto rounded-md object-cover"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <h3 className="text-lg font-semibold mb-2">{room.name}</h3>
                    <p className="text-gray-700 mb-4">{room.description}</p>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Type:</span> {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Capacity:</span> {room.capacity} guests
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Price:</span> {formatCurrency(room.price)}/night
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Show cancel button for pending/confirmed bookings */}
                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <Button 
                    variant="outline" 
                    className="w-full border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <span className="material-icons mr-2">cancel</span>
                    Cancel Booking
                  </Button>
                )}
                
                {/* Other useful actions */}
                <Button variant="outline" className="w-full" onClick={() => window.print()}>
                  <span className="material-icons mr-2">print</span>
                  Print Confirmation
                </Button>
                
                {room && (
                  <Link href={`/rooms/${booking.roomId}`}>
                    <Button variant="outline" className="w-full">
                      <span className="material-icons mr-2">hotel</span>
                      View Room Details
                    </Button>
                  </Link>
                )}
                
                <Button variant="outline" className="w-full">
                  <span className="material-icons mr-2">support_agent</span>
                  Contact Support
                </Button>
              </div>
              
              <Separator className="my-6" />
              
              {/* Summary */}
              <div>
                <h3 className="font-medium mb-2">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium">{statusLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dates:</span>
                    <span className="font-medium">{formatDateRange(booking.checkInDate, booking.checkOutDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Paid:</span>
                    <span className="font-medium">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Cancel Booking Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your booking? 
              {booking.status === 'confirmed' && (
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
