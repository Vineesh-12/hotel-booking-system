import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRooms } from '@/hooks/useRooms';
import { insertRoomSchema, Room } from '@shared/schema';
import { formatCurrency } from '@/lib/utils';

// Extend the insertRoomSchema for the form
const roomFormSchema = insertRoomSchema.extend({
  id: z.number().optional(),
  amenities: z.array(z.string()),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

export default function AdminRooms() {
  const [, setLocation] = useLocation();
  const { isAdmin, isAuthenticated, isLoading: authLoading } = useAuth();
  const { useAllRooms, useCreateRoom, useUpdateRoom, useDeleteRoom } = useRooms();
  const { data: rooms, isLoading: roomsLoading } = useAllRooms();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  
  // Form for creating/editing rooms
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'standard',
      price: 0,
      imageUrl: '',
      capacity: 2,
      amenities: [],
      isAvailable: true,
      rating: undefined,
    },
  });
  
  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      setLocation('/login?redirect=/admin/rooms');
    }
  }, [authLoading, isAuthenticated, isAdmin, setLocation]);

  // Handle form submission
  const onSubmit = async (values: RoomFormValues) => {
    try {
      if (editingRoom) {
        await updateRoom.mutateAsync({ id: editingRoom.id, ...values });
      } else {
        await createRoom.mutateAsync(values);
      }
      
      setIsDialogOpen(false);
      setEditingRoom(null);
      form.reset();
    } catch (error) {
      console.error('Failed to save room:', error);
    }
  };
  
  // Open dialog for creating a new room
  const handleAddRoom = () => {
    form.reset({
      name: '',
      description: '',
      type: 'standard',
      price: 0,
      imageUrl: '',
      capacity: 2,
      amenities: [],
      isAvailable: true,
      rating: undefined,
    });
    setEditingRoom(null);
    setIsDialogOpen(true);
  };
  
  // Open dialog for editing an existing room
  const handleEditRoom = (room: Room) => {
    form.reset({
      ...room,
      amenities: room.amenities as string[],
    });
    setEditingRoom(room);
    setIsDialogOpen(true);
  };
  
  // Confirm deletion of a room
  const handleDeleteRoom = (room: Room) => {
    setRoomToDelete(room);
    setIsDeleteDialogOpen(true);
  };
  
  // Execute room deletion
  const confirmDeleteRoom = async () => {
    if (roomToDelete) {
      try {
        await deleteRoom.mutateAsync(roomToDelete.id);
        setIsDeleteDialogOpen(false);
        setRoomToDelete(null);
      } catch (error) {
        console.error('Failed to delete room:', error);
      }
    }
  };
  
  // Available amenities for selection
  const availableAmenities = [
    { value: 'wifi', label: 'Free WiFi' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'ac', label: 'Air Conditioning' },
    { value: 'tv', label: 'Smart TV' },
    { value: 'pool', label: 'Pool Access' },
    { value: 'spa', label: 'Spa Access' },
    { value: 'minibar', label: 'Minibar' },
    { value: 'balcony', label: 'Balcony' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'ocean-view', label: 'Ocean View' },
  ];
  
  if (authLoading || roomsLoading) {
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
          <h1 className="text-3xl font-slab font-semibold">Room Management</h1>
          <p className="text-gray-500">Manage your hotel room inventory</p>
        </div>
        <Button onClick={handleAddRoom}>
          <span className="material-icons mr-2">add</span>
          Add New Room
        </Button>
      </div>
      
      {/* Room List */}
      <div className="grid grid-cols-1 gap-6">
        {!rooms || rooms.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mb-4">
                <span className="material-icons text-gray-400 text-5xl">hotel</span>
              </div>
              <h2 className="text-xl font-medium mb-2">No Rooms Found</h2>
              <p className="text-gray-500 mb-6">
                You haven't created any rooms yet. Add your first room to get started.
              </p>
              <Button onClick={handleAddRoom}>
                <span className="material-icons mr-2">add</span>
                Add Room
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Rooms ({rooms.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-3 font-medium">Room</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Price</th>
                      <th className="pb-3 font-medium">Capacity</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Rating</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.id} className="border-b">
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-md overflow-hidden mr-3">
                              <img 
                                src={room.imageUrl} 
                                alt={room.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{room.name}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                {room.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge variant="outline">
                            {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-4">{formatCurrency(room.price)}</td>
                        <td className="py-4">{room.capacity} guests</td>
                        <td className="py-4">
                          <Badge className={room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {room.isAvailable ? 'Available' : 'Unavailable'}
                          </Badge>
                        </td>
                        <td className="py-4">
                          {room.rating ? (
                            <div className="flex items-center">
                              <span className="material-icons text-yellow-500 text-sm mr-1">star</span>
                              <span>{room.rating.toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditRoom(room)}
                            >
                              <span className="material-icons">edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteRoom(room)}
                            >
                              <span className="material-icons">delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Room Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRoom ? 'Edit Room' : 'Add New Room'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Deluxe King Room" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Spacious room with king-sized bed and city views." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select room type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="deluxe">Deluxe</SelectItem>
                          <SelectItem value="suite">Suite</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Night ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="199.99" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest Capacity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="2" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/room.jpg" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter a URL for the room image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating (optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="4.5" 
                          step="0.1"
                          min="0"
                          max="5"
                          {...field}
                          value={field.value === undefined ? '' : field.value}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Rating from 0 to 5
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Availability</FormLabel>
                        <FormDescription>
                          Set this room as available for booking
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="amenities"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Room Amenities</FormLabel>
                      <FormDescription>
                        Select all amenities available in this room
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableAmenities.map((amenity) => (
                        <FormField
                          key={amenity.value}
                          control={form.control}
                          name="amenities"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={amenity.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(amenity.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, amenity.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== amenity.value
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {amenity.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createRoom.isPending || updateRoom.isPending}
                >
                  {createRoom.isPending || updateRoom.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Room'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="mb-2">
              Are you sure you want to delete this room:
            </p>
            <p className="font-medium">{roomToDelete?.name}</p>
            <p className="mt-4 text-sm text-red-500">
              This action cannot be undone. All bookings associated with this room will remain in the system.
            </p>
          </div>
          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteRoom}
              disabled={deleteRoom.isPending}
            >
              {deleteRoom.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                'Delete Room'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
