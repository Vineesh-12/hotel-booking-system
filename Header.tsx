import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="material-icons text-primary text-3xl">hotel</span>
          <h1 className="text-xl font-slab font-semibold">LuxStay Hotels</h1>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <Link href="/">
            <div className={`py-4 px-2 cursor-pointer ${location === '/' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-700 hover:text-primary transition duration-300'}`}>
              Home
            </div>
          </Link>
          <Link href="/rooms">
            <div className={`py-4 px-2 cursor-pointer ${location === '/rooms' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-700 hover:text-primary transition duration-300'}`}>
              Rooms
            </div>
          </Link>
          {isAuthenticated && (
            <Link href="/my-bookings">
              <div className={`py-4 px-2 cursor-pointer ${location === '/my-bookings' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-700 hover:text-primary transition duration-300'}`}>
                My Bookings
              </div>
            </Link>
          )}
          <Link href="/about">
            <div className={`py-4 px-2 cursor-pointer ${location === '/about' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-700 hover:text-primary transition duration-300'}`}>
              About
            </div>
          </Link>
          <Link href="/contact">
            <div className={`py-4 px-2 cursor-pointer ${location === '/contact' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-700 hover:text-primary transition duration-300'}`}>
              Contact
            </div>
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1">
                  <span className="material-icons">account_circle</span>
                  <span className="hidden md:inline">{user?.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-bookings">
                    <div className="w-full cursor-pointer">My Bookings</div>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Admin</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <div className="w-full cursor-pointer">Dashboard</div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/rooms">
                        <div className="w-full cursor-pointer">Manage Rooms</div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/bookings">
                        <div className="w-full cursor-pointer">Manage Bookings</div>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <span className="material-icons mr-2">logout</span>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="flex items-center">
                <span className="material-icons mr-1">login</span>
                <span className="hidden md:inline">Login</span>
              </Button>
            </Link>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            <span className="material-icons">menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
