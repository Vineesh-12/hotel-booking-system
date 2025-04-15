import { SearchBar } from '@/components/search/SearchBar';
import { RoomCard } from '@/components/rooms/RoomCard';
import { useRooms } from '@/hooks/useRooms';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { useAllRooms } = useRooms();
  const { data: rooms, isLoading } = useAllRooms();
  
  // Featured rooms - show top 3 rooms by rating
  const featuredRooms = rooms 
    ? [...rooms].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3)
    : [];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary-dark text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-slab font-bold mb-6">
              Experience Luxury & Comfort
            </h1>
            <p className="text-xl mb-8">
              Book your perfect stay at LuxStay Hotels - Where every stay becomes a memorable experience.
            </p>
            <Link href="/rooms">
              <Button className="bg-accent hover:bg-accent-dark text-white text-lg px-8 py-3 rounded-md">
                Browse Our Rooms
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <SearchBar />

      {/* Featured Rooms */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-slab font-semibold mb-8 text-center">
            Featured Rooms
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-5">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredRooms.map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link href="/rooms">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                View All Rooms <span className="material-icons ml-2">arrow_forward</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-slab font-semibold mb-8 text-center">
            Why Choose LuxStay
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-primary text-2xl">verified</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Price Guarantee</h3>
              <p className="text-gray-600">
                Find a lower price? We'll match it and give you an additional 10% off.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-primary text-2xl">security</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
              <p className="text-gray-600">
                Your booking is protected with advanced security measures and encryption.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-primary text-2xl">support_agent</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">
                Our customer support team is available around the clock to assist you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-slab font-semibold mb-8 text-center">
            What Our Guests Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-primary-light text-white p-1 rounded text-sm flex items-center mr-2">
                  <span className="material-icons text-sm">star</span>
                  <span>5.0</span>
                </div>
                <h3 className="font-semibold">Exceptional Service</h3>
              </div>
              <p className="text-gray-600 mb-4">
                "The staff went above and beyond to make our stay memorable. The room was immaculate and the amenities were top-notch."
              </p>
              <div className="font-medium">Sarah J. - New York</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-primary-light text-white p-1 rounded text-sm flex items-center mr-2">
                  <span className="material-icons text-sm">star</span>
                  <span>4.8</span>
                </div>
                <h3 className="font-semibold">Perfect Location</h3>
              </div>
              <p className="text-gray-600 mb-4">
                "Centrally located with easy access to all the attractions. The rooms were spacious and the beds were extremely comfortable."
              </p>
              <div className="font-medium">Michael T. - Chicago</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-primary-light text-white p-1 rounded text-sm flex items-center mr-2">
                  <span className="material-icons text-sm">star</span>
                  <span>4.9</span>
                </div>
                <h3 className="font-semibold">Luxury Experience</h3>
              </div>
              <p className="text-gray-600 mb-4">
                "From check-in to check-out, everything was perfect. The spa services were amazing and the restaurant offered delicious options."
              </p>
              <div className="font-medium">Emily R. - Los Angeles</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-slab font-semibold mb-4">
            Ready to Book Your Stay?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience luxury, comfort, and exceptional service at LuxStay Hotels. Book now and create unforgettable memories.
          </p>
          <Link href="/rooms">
            <Button className="bg-accent hover:bg-accent-dark text-white text-lg px-8 py-3 rounded-md">
              Book Now <span className="material-icons ml-1">arrow_forward</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
