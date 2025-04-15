import { useState, useEffect } from 'react';
import { RoomCard } from '@/components/rooms/RoomCard';
import { Room } from '@shared/schema';
import { Pagination } from '@/components/common/Pagination';
import { FilterParams, SortOption } from '@/lib/types';

interface RoomListProps {
  rooms: Room[];
  isLoading: boolean;
}

export function RoomList({ rooms, isLoading }: RoomListProps) {
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterParams>({
    roomType: '',
    price: '',
    amenities: '',
  });
  const [sorting, setSorting] = useState<SortOption>({
    option: 'recommended',
  });
  
  const roomsPerPage = 6;

  useEffect(() => {
    let result = [...rooms];
    
    // Apply filters
    if (filters.roomType) {
      result = result.filter(room => room.type === filters.roomType);
    }
    
    if (filters.price) {
      const [minPrice, maxPrice] = filters.price.split('-').map(price => 
        price === '+' ? Infinity : parseInt(price)
      );
      result = result.filter(room => 
        room.price >= minPrice && (maxPrice === Infinity || room.price <= maxPrice)
      );
    }
    
    if (filters.amenities) {
      result = result.filter(room => 
        (room.amenities as string[]).includes(filters.amenities)
      );
    }
    
    // Apply sorting
    switch (sorting.option) {
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        // 'recommended' - sort by rating first, then price
        result.sort((a, b) => {
          if (b.rating !== a.rating) {
            return (b.rating || 0) - (a.rating || 0);
          }
          return a.price - b.price;
        });
    }
    
    setFilteredRooms(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [rooms, filters, sorting]);

  // Get current rooms for pagination
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  const handleFilterChange = (name: keyof FilterParams, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSortChange = (option: string) => {
    setSorting({ option });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(3).fill(0).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-5">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredRooms.length === 0) {
    return (
      <div className="text-center py-10">
        <span className="material-icons text-5xl text-gray-400 mb-4">search_off</span>
        <h3 className="text-xl font-medium text-gray-600 mb-2">No rooms found</h3>
        <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentRooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
