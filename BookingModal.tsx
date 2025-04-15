import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Room } from '@shared/schema';
import { BookingForm } from '@/components/booking/BookingForm';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';

interface BookingModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
}

type BookingStep = 'form' | 'confirmation';

export function BookingModal({ room, isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState<BookingStep>('form');
  const [bookingReference, setBookingReference] = useState<string>('');

  const handleBookingSuccess = (reference: string) => {
    setBookingReference(reference);
    setStep('confirmation');
  };

  const handleClose = () => {
    // Reset state when closing
    setStep('form');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-slab font-medium">
            {step === 'form' ? 'Book Your Stay' : 'Booking Confirmed!'}
          </DialogTitle>
          {step === 'form' && (
            <DialogDescription>
              Complete the form below to book your stay at {room.name}.
            </DialogDescription>
          )}
        </DialogHeader>
        
        {step === 'form' ? (
          <BookingForm 
            room={room} 
            onBookingSuccess={handleBookingSuccess} 
          />
        ) : (
          <BookingConfirmation 
            bookingReference={bookingReference} 
            onClose={handleClose} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
