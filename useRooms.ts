import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Room } from '@shared/schema';
import { SearchParams } from '@/lib/types';

export function useRooms() {
  const queryClient = useQueryClient();

  // Fetch all rooms
  const useAllRooms = () => {
    return useQuery<Room[]>({
      queryKey: ['/api/rooms'],
    });
  };

  // Fetch a single room by ID
  const useRoom = (id: number | null) => {
    return useQuery<Room>({
      queryKey: ['/api/rooms', id],
      enabled: !!id,
    });
  };

  // Search for rooms with filters
  const useSearchRooms = (searchParams: SearchParams | null) => {
    return useQuery<Room[]>({
      queryKey: ['/api/rooms/search', searchParams],
      enabled: !!searchParams,
      queryFn: async () => {
        if (!searchParams) return [];
        const res = await apiRequest('POST', '/api/rooms/search', searchParams);
        return res.json();
      },
    });
  };

  // Check room availability for specific dates
  const useRoomAvailability = (roomId: number | null, startDate: string | null, endDate: string | null) => {
    return useQuery({
      queryKey: ['/api/rooms/availability', roomId, startDate, endDate],
      enabled: !!roomId && !!startDate && !!endDate,
      queryFn: async () => {
        if (!roomId || !startDate || !endDate) return { isAvailable: false, dates: [] };
        const res = await fetch(`/api/rooms/${roomId}/availability?startDate=${startDate}&endDate=${endDate}`);
        if (!res.ok) throw new Error('Failed to check availability');
        return res.json();
      },
    });
  };

  // Admin mutations
  const useCreateRoom = () => {
    return useMutation({
      mutationFn: async (newRoom: Omit<Room, 'id'>) => {
        const res = await apiRequest('POST', '/api/admin/rooms', newRoom);
        return res.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      },
    });
  };

  const useUpdateRoom = () => {
    return useMutation({
      mutationFn: async ({ id, ...data }: Partial<Room> & { id: number }) => {
        const res = await apiRequest('PUT', `/api/admin/rooms/${id}`, data);
        return res.json();
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
        queryClient.invalidateQueries({ queryKey: ['/api/rooms', variables.id] });
      },
    });
  };

  const useDeleteRoom = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const res = await apiRequest('DELETE', `/api/admin/rooms/${id}`, undefined);
        return res.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      },
    });
  };

  return {
    useAllRooms,
    useRoom,
    useSearchRooms,
    useRoomAvailability,
    useCreateRoom,
    useUpdateRoom,
    useDeleteRoom,
  };
}
