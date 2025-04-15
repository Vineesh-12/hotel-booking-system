import { useState } from 'react';
import { useLocation } from 'wouter';
import { addDays, format } from 'date-fns';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchParams } from '@/lib/types';

const searchSchema = z.object({
  checkInDate: z.string().min(1, { message: 'Check-in date is required' }),
  checkOutDate: z.string().min(1, { message: 'Check-out date is required' }),
  guests: z.string().min(1, { message: 'Please select number of guests' }),
});

export function SearchBar() {
  const [, setLocation] = useLocation();
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      checkInDate: format(today, 'yyyy-MM-dd'),
      checkOutDate: format(tomorrow, 'yyyy-MM-dd'),
      guests: '2',
    },
  });

  const onSubmit = (data: z.infer<typeof searchSchema>) => {
    const searchParams: SearchParams = {
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      guests: parseInt(data.guests),
    };
    
    // Encode search params for URL
    const queryString = new URLSearchParams({
      checkIn: searchParams.checkInDate,
      checkOut: searchParams.checkOutDate,
      guests: searchParams.guests.toString(),
    }).toString();
    
    setLocation(`/rooms?${queryString}`);
  };

  return (
    <section className="bg-primary-dark text-white py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-slab mb-6 text-center">Find Your Perfect Stay</h2>
        
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)}
            className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="checkInDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Check-in Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          {...field}
                          min={format(today, 'yyyy-MM-dd')}
                          className="w-full pl-4 pr-10"
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
                name="checkOutDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Check-out Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          {...field}
                          min={format(tomorrow, 'yyyy-MM-dd')}
                          className="w-full pl-4 pr-10"
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
                name="guests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Guests</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select number of guests" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 Guest</SelectItem>
                        <SelectItem value="2">2 Guests</SelectItem>
                        <SelectItem value="3">3 Guests</SelectItem>
                        <SelectItem value="4">4 Guests</SelectItem>
                        <SelectItem value="5">5+ Guests</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button type="submit" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 flex items-center">
                <span className="material-icons mr-2">search</span>
                Search Availability
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
