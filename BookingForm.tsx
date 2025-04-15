import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { differenceInDays, addDays, format } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Room } from '@shared/schema';
import { RoomCalendar } from '@/components/booking/RoomCalendar';
import { formatCurrency, formatDateRange, calculateTotalAmount } from '@/lib/utils';
import { useBooking } from '@/hooks/useBooking';
import { useToast } from '@/hooks/use-toast';

interface BookingFormProps {
  room: Room;
  onBookingSuccess: (reference: string) => void;
}

const today = new Date();
const tomorrow = addDays(today, 1);

const bookingFormSchema = z.object({
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  guests: z.string().min(1, "Number of guests is required"),
  guestName: z.string().min(2, "Name is required"),
  guestEmail: z.string().email("Invalid email address"),
  guestPhone: z.string().min(5, "Phone number is required"),
  specialRequests: z.string().optional(),
  // Payment fields
  cardName: z.string().min(2, "Name on card is required"),
  cardNumber: z.string().min(16, "Card number is required"),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, "Expiry date must be in MM/YY format"),
  cvv: z.string().min(3, "Security code is required"),
  termsAgreed: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms" }),
  }),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  return checkOut > checkIn;
}, {
  message: "Check-out date must be after check-in date",
  path: ["checkOut"],
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export function BookingForm({ room, onBookingSuccess }: BookingFormProps) {
  const { toast } = useToast();
  const { useCreateBooking, useProcessPayment } = useBooking();
  const createBookingMutation = useCreateBooking();
  const processPaymentMutation = useProcessPayment();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      checkIn: format(today, 'yyyy-MM-dd'),
      checkOut: format(tomorrow, 'yyyy-MM-dd'),
      guests: '2',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      specialRequests: '',
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      termsAgreed: false,
    },
  });

  const checkInDate = form.watch('checkIn');
  const checkOutDate = form.watch('checkOut');
  
  const nights = differenceInDays(
    new Date(checkOutDate || tomorrow),
    new Date(checkInDate || today)
  );
  
  const priceDetails = calculateTotalAmount(room.price, nights);

  const onSubmit = async (data: BookingFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create booking
      const bookingData = {
        bookingData: {
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: parseInt(data.guests),
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
          specialRequests: data.specialRequests,
        },
        room,
      };
      
      const booking = await createBookingMutation.mutateAsync(bookingData);
      
      // Process payment
      const paymentData = {
        bookingId: booking.id,
        paymentData: {
          cardName: data.cardName,
          cardNumber: data.cardNumber,
          expiryDate: data.expiryDate,
          cvv: data.cvv,
        },
        amount: priceDetails.total,
      };
      
      await processPaymentMutation.mutateAsync(paymentData);
      
      // Notify success
      toast({
        title: 'Booking successful!',
        description: `Your booking reference number is ${booking.referenceNumber}`,
      });
      
      onBookingSuccess(booking.referenceNumber);
    } catch (error) {
      toast({
        title: 'Booking failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Room Details Summary */}
        <div className="mb-6 bg-gray-50 p-4 rounded-md">
          <div className="flex items-start">
            <img
              src={room.imageUrl}
              alt={room.name}
              className="w-20 h-20 object-cover rounded mr-4"
            />
            <div>
              <h3 className="font-semibold">{room.name}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <span className="material-icons text-sm mr-1">calendar_today</span>
                <span>{formatDateRange(checkInDate, checkOutDate)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <span className="material-icons text-sm mr-1">person</span>
                <span>{form.watch('guests')} Guests</span>
              </div>
            </div>
            
            <div className="ml-auto text-right">
              <div className="text-xl font-bold text-gray-800">{formatCurrency(room.price)}</div>
              <div className="text-gray-500 text-sm">per night</div>
            </div>
          </div>
        </div>
        
        {/* Date Selection */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Choose Your Dates</h3>
          
          <div className="flex flex-col md:flex-row gap-4">
            <FormField
              control={form.control}
              name="checkIn"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/2">
                  <FormLabel>Check-in Date</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="date"
                        min={format(today, 'yyyy-MM-dd')}
                        {...field}
                        className="pl-4 pr-10"
                      />
                      <span className="material-icons absolute right-3 top-2 text-gray-500 pointer-events-none">
                        calendar_today
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="checkOut"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/2">
                  <FormLabel>Check-out Date</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="date"
                        min={format(addDays(new Date(checkInDate || today), 1), 'yyyy-MM-dd')}
                        {...field}
                        className="pl-4 pr-10"
                      />
                      <span className="material-icons absolute right-3 top-2 text-gray-500 pointer-events-none">
                        calendar_today
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <RoomCalendar 
            roomId={room.id}
            selectedStartDate={checkInDate ? new Date(checkInDate) : undefined}
            selectedEndDate={checkOutDate ? new Date(checkOutDate) : undefined}
            onDateChange={(start, end) => {
              if (start) form.setValue('checkIn', format(start, 'yyyy-MM-dd'));
              if (end) form.setValue('checkOut', format(end, 'yyyy-MM-dd'));
            }}
          />
        </div>
        
        {/* Guest Information */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Guest Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="guestEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="guestPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="guests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Guests</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of guests" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 Guest</SelectItem>
                      <SelectItem value="2">2 Guests</SelectItem>
                      <SelectItem value="3">3 Guests</SelectItem>
                      <SelectItem value="4">4 Guests</SelectItem>
                      <SelectItem value="5">5 Guests</SelectItem>
                      <SelectItem value="6">6 Guests</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="mt-4">
            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special requirements or requests?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Payment Details */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Payment Details</h3>
          
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <h4 className="font-medium text-sm mb-2">Price Details</h4>
            <div className="flex justify-between text-sm mb-1">
              <span>{formatCurrency(room.price)} x {nights} {nights === 1 ? 'night' : 'nights'}</span>
              <span>{formatCurrency(priceDetails.roomTotal)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Cleaning fee</span>
              <span>{formatCurrency(priceDetails.cleaningFee)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Service fee</span>
              <span>{formatCurrency(priceDetails.serviceFee)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Taxes (12%)</span>
              <span>{formatCurrency(priceDetails.taxes)}</span>
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(priceDetails.total)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="cardName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name on Card</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="4242 4242 4242 4242"
                        {...field}
                        className="pl-4 pr-10"
                      />
                      <div className="absolute right-3 top-2 flex space-x-1">
                        <span className="material-icons text-gray-500">credit_card</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input placeholder="MM/YY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Code</FormLabel>
                    <FormControl>
                      <Input placeholder="123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        
        {/* Agreement */}
        <div className="mb-6">
          <FormField
            control={form.control}
            name="termsAgreed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm text-gray-600">
                    I agree to the <a href="#" className="text-primary hover:underline">Terms and Conditions</a>, 
                    <a href="#" className="text-primary hover:underline">Cancellation Policy</a>, and 
                    <a href="#" className="text-primary hover:underline">Hotel Rules</a>.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>
        
        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary-dark text-white px-6 py-3 flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <span className="material-icons mr-2">check_circle</span>
              Complete Booking
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
