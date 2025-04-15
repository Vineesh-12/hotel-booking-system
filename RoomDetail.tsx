import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { format, addDays } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRooms } from '@/hooks/useRooms';
import { formatCurrency, getAmenityLabel, getRoomTypeLabel } from '@/lib/utils';
import { BookingModal } from '@/components/booking/BookingModal';
import { RoomCalendar } from '@/components/booking/RoomCalendar';

export default function RoomDetail() {
  const { id } = useParams();
  const roomId = parseInt(id);
  const { useRoom, useRoomAvailability } = useRooms();
  const { data: room, isLoading, error } = useRoom(roomId);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  // Default dates for availability check
  const today = new Date();
  const inOneWeek = addDays(today, 7);
  
  const [checkInDate, setCheckInDate] = useState<string>(format(today, 'yyyy-MM-dd'));
  const [checkOutDate, setCheckOutDate] = useState<string>(format(inOneWeek, 'yyyy-MM-dd'));
  
  // Check room availability for selected dates
  const { data: availability } = useRoomAvailability(
    roomId,
    checkInDate,
    checkOutDate
  );
  
  const handleDateChange = (start: Date | undefined, end: Date | undefined) => {
    if (start) setCheckInDate(format(start, 'yyyy-MM-dd'));
    if (end) setCheckOutDate(format(end, 'yyyy-MM-dd'));
  };
  
  const openBookingModal = () => {
    setIsBookingModalOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-80 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            </div>
            <div>
              <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !room) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mb-6">
          <span className="material-icons text-red-500 text-6xl">error</span>
        </div>
        <h2 className="text-2xl font-semibold mb-4">Room Not Found</h2>
        <p className="text-gray-600 mb-8">
          We couldn't find the room you're looking for. It may have been removed or the URL might be incorrect.
        </p>
        <Link href="/rooms">
          <Button>Browse All Rooms</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/rooms">
          <Button variant="ghost" className="mb-2">
            <span className="material-icons mr-1">arrow_back</span> Back to Rooms
          </Button>
        </Link>
        <h1 className="text-3xl font-slab font-semibold">{room.name}</h1>
        <div className="flex items-center mt-2">
          <Badge className="mr-2 bg-primary-light">{getRoomTypeLabel(room.type)}</Badge>
          {room.rating && (
            <div className="flex items-center text-sm">
              <span className="material-icons text-yellow-500 text-sm mr-1">star</span>
              <span>{room.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Room Image */}
          <div className="rounded-lg overflow-hidden mb-6 h-[400px]">
            <img 
              src={room.imageUrl} 
              alt={room.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Room Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 mb-4">{room.description}</p>
            
            <h3 className="text-lg font-medium mt-6 mb-3">Room Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(room.amenities as string[]).map((amenity) => {
                const { label, icon } = getAmenityLabel(amenity);
                return (
                  <div key={amenity} className="flex items-center">
                    <span className="material-icons text-primary mr-2">{icon}</span>
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Calendar and Availability */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Check Availability</h2>
            <Card>
              <CardContent className="p-4">
                <RoomCalendar 
                  roomId={room.id}
                  selectedStartDate={checkInDate ? new Date(checkInDate) : undefined}
                  selectedEndDate={checkOutDate ? new Date(checkOutDate) : undefined}
                  onDateChange={handleDateChange}
                />
                
                <div className="mt-4 flex justify-center">
                  {availability?.isAvailable ? (
                    <Button onClick={openBookingModal} className="bg-primary hover:bg-primary-dark text-white">
                      <span className="material-icons mr-2">event_available</span>
                      Book Selected Dates
                    </Button>
                  ) : (
                    <Badge variant="destructive" className="py-2 px-4">
                      <span className="material-icons mr-2">event_busy</span>
                      Not Available for Selected Dates
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Policies */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Policies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <span className="material-icons mr-2 text-primary">schedule</span>
                    Check-in/Check-out
                  </h3>
                  <ul className="text-sm space-y-2">
                    <li>Check-in: From 3:00 PM</li>
                    <li>Check-out: Until 11:00 AM</li>
                    <li>Early check-in subject to availability</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <span className="material-icons mr-2 text-primary">policy</span>
                    Cancellation
                  </h3>
                  <ul className="text-sm space-y-2">
                    <li>Free cancellation up to 48 hours before check-in</li>
                    <li>50% refund for cancellations within 48 hours</li>
                    <li>No refund for no-shows</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Booking Card */}
        <div className="md:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold">{formatCurrency(room.price)}</span>
                  <span className="text-gray-500">/night</span>
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  {room.capacity} guest{room.capacity !== 1 ? 's' : ''} maximum
                </div>
                {room.rating && (
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="material-icons text-yellow-500 text-sm mr-1">star</span>
                    <span>{room.rating.toFixed(1)} rating</span>
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div className="mb-6">
                <h3 className="font-medium mb-3">Dates</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Check-in</div>
                    <div className="font-medium">{format(new Date(checkInDate), 'MMM dd, yyyy')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Check-out</div>
                    <div className="font-medium">{format(new Date(checkOutDate), 'MMM dd, yyyy')}</div>
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <Button
                onClick={openBookingModal}
                className="w-full bg-primary hover:bg-primary-dark text-white"
                disabled={!availability?.isAvailable}
              >
                {availability?.isAvailable ? 'Book Now' : 'Not Available'}
              </Button>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                You won't be charged yet
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {isBookingModalOpen && (
        <BookingModal 
          room={room} 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)} 
        />
      )}
    </div>
  );
}
