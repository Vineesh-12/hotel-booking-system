import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRooms } from '@/hooks/useRooms';
import { useBooking } from '@/hooks/useBooking';
import { formatCurrency } from '@/lib/utils';

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, isAdmin, isAuthenticated, isLoading } = useAuth();
  const { useAllRooms } = useRooms();
  const { useAllBookings } = useBooking();
  
  const { data: rooms, isLoading: roomsLoading } = useAllRooms();
  const { data: bookings, isLoading: bookingsLoading } = useAllBookings();
  
  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      setLocation('/login?redirect=/admin');
    }
  }, [isLoading, isAuthenticated, isAdmin, setLocation]);
  
  if (isLoading || roomsLoading || bookingsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }
  
  // Calculate dashboard statistics
  const totalRooms = rooms?.length || 0;
  const availableRooms = rooms?.filter(room => room.isAvailable).length || 0;
  const totalBookings = bookings?.length || 0;
  const activeBookings = bookings?.filter(booking => 
    booking.status === 'pending' || booking.status === 'confirmed'
  ).length || 0;
  
  const totalRevenue = bookings?.reduce((sum, booking) => sum + booking.totalAmount, 0) || 0;
  
  // Get recent bookings
  const recentBookings = bookings
    ? [...bookings]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    : [];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-slab font-semibold">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <Link href="/admin/rooms">
            <Button>
              <span className="material-icons mr-1">hotel</span>
              Manage Rooms
            </Button>
          </Link>
          <Link href="/admin/bookings">
            <Button>
              <span className="material-icons mr-1">book_online</span>
              Manage Bookings
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Rooms</CardDescription>
            <CardTitle className="text-3xl">{totalRooms}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-600">
              {availableRooms} rooms available
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Bookings</CardDescription>
            <CardTitle className="text-3xl">{totalBookings}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-600">
              {activeBookings} active bookings
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Occupancy Rate</CardDescription>
            <CardTitle className="text-3xl">
              {totalRooms === 0 ? 0 : Math.round((1 - availableRooms / totalRooms) * 100)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {totalRooms - availableRooms} rooms occupied
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(totalRevenue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              All time
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Bookings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>
            Latest booking activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No bookings found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2 font-medium">Reference</th>
                    <th className="pb-2 font-medium">Room</th>
                    <th className="pb-2 font-medium">Guest</th>
                    <th className="pb-2 font-medium">Dates</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b last:border-0">
                      <td className="py-3 text-sm">{booking.referenceNumber}</td>
                      <td className="py-3 text-sm">Room #{booking.roomId}</td>
                      <td className="py-3 text-sm">{booking.guestName}</td>
                      <td className="py-3 text-sm">
                        {new Date(booking.checkInDate).toLocaleDateString()} - 
                        {new Date(booking.checkOutDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 text-sm">{formatCurrency(booking.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Link href="/admin/bookings">
            <Button variant="outline">View All Bookings</Button>
          </Link>
        </CardFooter>
      </Card>
      
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Room Management</CardTitle>
            <CardDescription>Add, edit, or delete rooms</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Manage your room inventory, update prices, and set availability.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/rooms">
              <Button className="w-full">Manage Rooms</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Booking Management</CardTitle>
            <CardDescription>View and manage all bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              View booking details, update status, and handle cancellations.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/bookings">
              <Button className="w-full">Manage Bookings</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Website Settings</CardTitle>
            <CardDescription>Configure website options</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Manage global settings, taxes, fees, and policies.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled>
              Coming Soon
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
