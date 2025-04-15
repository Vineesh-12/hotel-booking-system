import { Link, useLocation } from 'wouter';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [location] = useLocation();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="md:hidden bg-white shadow-md fixed inset-0 z-50 pt-16 pb-6 px-4 overflow-y-auto">
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        onClick={onClose}
      >
        <span className="material-icons">close</span>
      </button>
      
      <nav className="flex flex-col space-y-4 mt-4">
        <Link href="/">
          <a 
            className={`py-2 px-4 rounded-md ${location === '/' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={onClose}
          >
            <span className="material-icons mr-2 align-middle">home</span>
            Home
          </a>
        </Link>
        <Link href="/rooms">
          <a 
            className={`py-2 px-4 rounded-md ${location === '/rooms' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={onClose}
          >
            <span className="material-icons mr-2 align-middle">king_bed</span>
            Rooms
          </a>
        </Link>
        <Link href="/my-bookings">
          <a 
            className={`py-2 px-4 rounded-md ${location === '/my-bookings' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={onClose}
          >
            <span className="material-icons mr-2 align-middle">book_online</span>
            My Bookings
          </a>
        </Link>
        <Link href="/about">
          <a 
            className={`py-2 px-4 rounded-md ${location === '/about' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={onClose}
          >
            <span className="material-icons mr-2 align-middle">info</span>
            About
          </a>
        </Link>
        <Link href="/contact">
          <a 
            className={`py-2 px-4 rounded-md ${location === '/contact' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={onClose}
          >
            <span className="material-icons mr-2 align-middle">contact_support</span>
            Contact
          </a>
        </Link>
      </nav>
      
      <div className="mt-8 border-t border-gray-200 pt-6">
        <Link href="/login">
          <a 
            className="block w-full py-2 px-4 bg-primary text-white rounded-md text-center"
            onClick={onClose}
          >
            <span className="material-icons mr-2 align-middle">login</span>
            Login / Sign Up
          </a>
        </Link>
      </div>
    </div>
  );
}
