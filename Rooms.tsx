import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { SearchBar } from '@/components/search/SearchBar';
import { RoomList } from '@/components/rooms/RoomList';
import { FilterBar } from '@/components/rooms/FilterBar';
import { useRooms } from '@/hooks/useRooms';
import { SearchParams, FilterParams, SortOption } from '@/lib/types';

export default function Rooms() {
  const [location] = useLocation();
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [filters, setFilters] = useState<FilterParams>({
    roomType: '',
    price: '',
    amenities: '',
  });
  const [sorting, setSorting] = useState<SortOption>({
    option: 'recommended',
  });

  // Parse search params from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const checkIn = params.get('checkIn');
    const checkOut = params.get('checkOut');
    const guests = params.get('guests');

    if (checkIn && checkOut && guests) {
      setSearchParams({
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests: parseInt(guests),
      });
    } else {
      // Default to all rooms if no search params
      setSearchParams(null);
    }
  }, [location]);

  // Search for rooms or get all rooms if no search params
  const { useSearchRooms, useAllRooms } = useRooms();
  const searchResult = useSearchRooms(searchParams);
  const allRooms = useAllRooms();

  const { data: rooms, isLoading } = searchParams ? searchResult : allRooms;

  const handleFilterChange = (name: keyof FilterParams, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSortChange = (option: string) => {
    setSorting({ option });
  };

  return (
    <div>
      {/* Search Bar */}
      <SearchBar />

      {/* Room Listing */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-slab font-semibold mb-8">
            {searchParams 
              ? `Available Rooms (${searchParams.checkInDate} - ${searchParams.checkOutDate})` 
              : 'All Rooms'}
          </h2>

          {/* Filter Bar */}
          <FilterBar 
            filters={filters} 
            sorting={sorting} 
            onFilterChange={handleFilterChange} 
            onSortChange={handleSortChange} 
          />

          {/* Room List */}
          <RoomList 
            rooms={rooms || []} 
            isLoading={isLoading} 
          />
        </div>
      </section>
    </div>
  );
}
