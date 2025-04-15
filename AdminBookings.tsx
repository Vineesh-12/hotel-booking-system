import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useBooking } from '@/hooks/useBooking';
import { formatCurrency, formatDateRange, getBookingStatusLabel } from '@/lib/utils';
import { Booking } from '@shared/schema';

export default function AdminBookings() {
  const [, setLocation] = useLocation();
  const { isAdmin, isAuthenticated, isLoading: authLoading } = useAuth();
  const { useAllBookings, useUpdateBooking, useCancelBooking } = useBooking();
  const { data: bookings, isLoading: bookingsLoading } = useAllBookings();
  const updateBookingMutation = useUpdateBooking();
  const cancelBookingMutation = useCancelBooking();
  
  // State for filters and sorting
  const [filter, setFilter] = useState({
    status: '',
    search: '',
  });
  const [sortOption, setSortOption] = useState('newest');
  
  // State for booking actions
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      setLocation('/login?redirect=/admin/bookings');
    }
  }, [authLoading, isAuthenticated, isAdmin, setLocation]);

  // Filter and sort bookings
  const filteredBookings = bookings?.filter(booking => {
    // Filter by status
    if (filter.status && filter.status !== 'all' && booking.status !== filter.status) {
      return false;
    }
    
    // Filter by search term (reference number, guest name, or guest email)
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      return (
        booking.referenceNumber.toLowerCase().includes(searchTerm) ||
        booking.guestName.toLowerCase().includes(searchTerm) ||
        booking.guestEmail.toLowerCase().includes(searchTerm)
      );
    }
    
    return true;
  }) || [];
  
  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'check-in':
        return new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime();
      case 'check-out':
        return new Date(a.checkOutDate).getTime() - new Date(b.checkOutDate).getTime();
      case 'price-high':
        return b.totalAmount - a.totalAmount;
      case 'price-low':
        return a.totalAmount - b.totalAmount;
      default:
        return 0;
    }
  });

  // Handle booking status update
  const handleStatusUpdate = async () => {
    if (selectedBooking && newStatus) {
      try {
        await updateBookingMutation.mutateAsync({
          id: selectedBooking.id,
          status: newStatus,
        });
        setIsStatusDialogOpen(false);
        setSelectedBooking(null);
      } catch (error) {
        console.error('Failed to update booking status:', error);
      }
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    if (selectedBooking) {
      try {
        await cancelBookingMutation.mutateAsync(selectedBooking.id);
        setIsCancelDialogOpen(false);
        setSelectedBooking(null);
      } catch (error) {
        console.error('Failed to cancel booking:', error);
      }
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({ ...prev, search: e.target.value }));
  };

  // Helpers to open dialogs
  const openViewDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
  };

  const openStatusDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setIsStatusDialogOpen(true);
  };

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsCancelDialogOpen(true);
  };

  if (authLoading || bookingsLoading) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-slab font-semibold">Booking Management</h1>
          <p className="text-gray-500">View and manage all guest bookings</p>
        </div>
        <Link href="/admin">
          <Button variant="outline">
            <span className="material-icons mr-1">dashboard</span>
            Dashboard
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by reference, name or email"
                value={filter.search}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>
            <Select
              value={filter.status}
              onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortOption}
              onValueChange={setSortOption}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="check-in">Check-in Date</SelectItem>
                <SelectItem value="check-out">Check-out Date</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Bookings ({sortedBookings.length})
            {filter.status && filter.status !== 'all' && (
              <Badge className="ml-2">{filter.status.charAt(0).toUpperCase() + filter.status.slice(1)}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedBookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="mb-3">
                <span className="material-icons text-4xl text-gray-400">search_off</span>
              </div>
              <h3 className="text-lg font-medium mb-1">No bookings found</h3>
              <p className="text-gray-500">
                {(filter.status && filter.status !== 'all') || filter.search
                  ? "Try adjusting your filters"
                  : "There are no bookings in the system yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-3 font-medium">Reference</th>
                    <th className="pb-3 font-medium">Room</th>
                    <th className="pb-3 font-medium">Guest</th>
                    <th className="pb-3 font-medium">Dates</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBookings.map((booking) => {
                    const { label: statusLabel, color: statusColor } = getBookingStatusLabel(booking.status);
                    
                    return (
                      <tr key={booking.id} className="border-b">
                        <td className="py-3">
                          <div className="font-medium">{booking.referenceNumber}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3">Room #{booking.roomId}</td>
                        <td className="py-3">
                          <div>{booking.guestName}</div>
                          <div className="text-xs text-gray-500">{booking.guestEmail}</div>
                        </td>
                        <td className="py-3">
                          <div className="text-sm">
                            {formatDateRange(booking.checkInDate, booking.checkOutDate)}
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge className={statusColor + " text-white"}>
                            {statusLabel}
                          </Badge>
                        </td>
                        <td className="py-3">{formatCurrency(booking.totalAmount)}</td>
                        <td className="py-3">
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="View Details"
                              onClick={() => openViewDialog(booking)}
                            >
                              <span className="material-icons text-gray-500">visibility</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Update Status"
                              onClick={() => openStatusDialog(booking)}
                            >
                              <span className="material-icons text-blue-500">edit</span>
                            </Button>
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Cancel Booking"
                                onClick={() => openCancelDialog(booking)}
                              >
                                <span className="material-icons text-red-500">cancel</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Booking Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Reference: {selectedBooking?.referenceNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Guest Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">Name:</span> {selectedBooking.guestName}
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">Email:</span> {selectedBooking.guestEmail}
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">Phone:</span> {selectedBooking.guestPhone}
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">Guests:</span> {selectedBooking.guestCount}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Booking Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">Check-in:</span> {formatDateString(selectedBooking.checkInDate)}
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">Check-out:</span> {formatDateString(selectedBooking.checkOutDate)}
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">Room:</span> #{selectedBooking.roomId}
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">Status:</span>{" "}
                    <Badge className={getBookingStatusLabel(selectedBooking.status).color + " text-white"}>
                      {getBookingStatusLabel(selectedBooking.status).label}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">Date created:</span> {formatDateString(selectedBooking.createdAt)}
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">Total amount:</span> {formatCurrency(selectedBooking.totalAmount)}
                  </div>
                </div>
              </div>

              {selectedBooking.specialRequests && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Special Requests</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    {selectedBooking.specialRequests}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Link href={`/booking/${selectedBooking.referenceNumber}`}>
                  <Button>
                    View Full Details
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>
              Change the status of booking {selectedBooking?.referenceNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Select
              value={newStatus}
              onValueChange={setNewStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <div className="mt-3 text-sm text-gray-500">
              <p>Status descriptions:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li><span className="font-medium">Pending</span>: Booking is awaiting confirmation</li>
                <li><span className="font-medium">Confirmed</span>: Booking is confirmed and payment is processed</li>
                <li><span className="font-medium">Cancelled</span>: Booking has been cancelled</li>
                <li><span className="font-medium">Completed</span>: Guest's stay has been completed</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleStatusUpdate}
              disabled={updateBookingMutation.isPending}
            >
              {updateBookingMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel booking {selectedBooking?.referenceNumber}?
              <br />
              <span className="text-red-500 font-medium mt-2 block">
                This will notify the guest and the room will be made available again.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Booking</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={handleCancelBooking}
              disabled={cancelBookingMutation.isPending}
            >
              {cancelBookingMutation.isPending ? 'Cancelling...' : 'Yes, Cancel Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper function to format dates
function formatDateString(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
