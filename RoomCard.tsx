import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Room } from '@shared/schema';
import { formatCurrency, getAmenityLabel } from '@/lib/utils';
import { BookingModal } from '@/components/booking/BookingModal';

interface RoomCardProps {
  room: Room;
  showBookButton?: boolean;
}

export function RoomCard({ room, showBookButton = true }: RoomCardProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const openBookingModal = () => {
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition transform hover:-translate-y-1 hover:shadow-lg">
        <div className="relative h-48">
          <img
            src={room.imageUrl}
            alt={room.name}
            className="w-full h-full object-cover"
          />
          {room.rating && room.rating >= 4.8 && (
            <div className="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
              Popular
            </div>
          )}
          {room.price < 150 && (
            <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              Best Value
            </div>
          )}
        </div>
        
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">
              <Link href={`/rooms/${room.id}`}>
                <a className="hover:text-primary transition-colors">{room.name}</a>
              </Link>
            </h3>
            {room.rating && (
              <div className="bg-primary-light text-white px-2 py-1 rounded text-sm flex items-center">
                <span className="material-icons text-sm mr-1">star</span>
                <span>{room.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 mb-4 text-sm line-clamp-2">{room.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {(room.amenities as string[]).slice(0, 3).map((amenity) => {
              const { label, icon } = getAmenityLabel(amenity);
              return (
                <span key={amenity} className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                  <span className="material-icons text-sm mr-1 text-gray-500">{icon}</span> {label}
                </span>
              );
            })}
            {(room.amenities as string[]).length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{(room.amenities as string[]).length - 3} more
              </Badge>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xl font-bold text-gray-800">{formatCurrency(room.price)}</span>
              <span className="text-gray-500 text-sm">/night</span>
            </div>
            {showBookButton && (
              <Button onClick={openBookingModal} className="bg-primary hover:bg-primary-dark text-white">
                Book Now
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {isBookingModalOpen && (
        <BookingModal room={room} isOpen={isBookingModalOpen} onClose={closeBookingModal} />
      )}
    </>
  );
}
