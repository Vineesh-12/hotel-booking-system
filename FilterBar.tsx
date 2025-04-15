import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterParams, SortOption } from '@/lib/types';

interface FilterBarProps {
  filters: FilterParams;
  sorting: SortOption;
  onFilterChange: (name: keyof FilterParams, value: string) => void;
  onSortChange: (option: string) => void;
}

export function FilterBar({ filters, sorting, onFilterChange, onSortChange }: FilterBarProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm">
        <span className="text-gray-700 text-sm mr-2">Filter by:</span>
        
        <Select 
          value={filters.roomType} 
          onValueChange={(value) => onFilterChange('roomType', value)}
        >
          <SelectTrigger className="border-0 shadow-none focus:ring-0 text-sm text-gray-700 w-32">
            <SelectValue placeholder="Room Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="deluxe">Deluxe</SelectItem>
            <SelectItem value="suite">Suite</SelectItem>
            <SelectItem value="executive">Executive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm">
        <Select 
          value={filters.price} 
          onValueChange={(value) => onFilterChange('price', value)}
        >
          <SelectTrigger className="border-0 shadow-none focus:ring-0 text-sm text-gray-700 w-36">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Price</SelectItem>
            <SelectItem value="0-100">$0 - $100</SelectItem>
            <SelectItem value="100-200">$100 - $200</SelectItem>
            <SelectItem value="200-300">$200 - $300</SelectItem>
            <SelectItem value="300-+">$300+</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm">
        <Select 
          value={filters.amenities} 
          onValueChange={(value) => onFilterChange('amenities', value)}
        >
          <SelectTrigger className="border-0 shadow-none focus:ring-0 text-sm text-gray-700 w-32">
            <SelectValue placeholder="Amenities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Amenities</SelectItem>
            <SelectItem value="wifi">Free WiFi</SelectItem>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="pool">Swimming Pool</SelectItem>
            <SelectItem value="spa">Spa Access</SelectItem>
            <SelectItem value="minibar">Minibar</SelectItem>
            <SelectItem value="balcony">Balcony</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="ml-auto">
        <Select 
          value={sorting.option} 
          onValueChange={onSortChange}
        >
          <SelectTrigger className="bg-white px-4 py-2 rounded-md shadow-sm border-0 focus:ring-0 text-sm text-gray-700 w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Guest Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
