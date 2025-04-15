import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="bg-secondary text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-slab font-semibold mb-4">LuxStay Hotels</h3>
            <p className="text-gray-300 mb-4">
              Experience luxury and comfort at our prime locations around the world.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition">
                <span className="material-icons">facebook</span>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <span className="material-icons">twitter</span>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <span className="material-icons">instagram</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <div className="text-gray-300 hover:text-white transition">Home</div>
                </Link>
              </li>
              <li>
                <Link href="/rooms">
                  <div className="text-gray-300 hover:text-white transition">Rooms & Suites</div>
                </Link>
              </li>
              <li>
                <Link href="/amenities">
                  <div className="text-gray-300 hover:text-white transition">Amenities</div>
                </Link>
              </li>
              <li>
                <Link href="/offers">
                  <div className="text-gray-300 hover:text-white transition">Special Offers</div>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <div className="text-gray-300 hover:text-white transition">Contact Us</div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Policies</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy">
                  <div className="text-gray-300 hover:text-white transition">Privacy Policy</div>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <div className="text-gray-300 hover:text-white transition">Terms of Service</div>
                </Link>
              </li>
              <li>
                <Link href="/cancellation">
                  <div className="text-gray-300 hover:text-white transition">Cancellation Policy</div>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <div className="text-gray-300 hover:text-white transition">FAQ</div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="material-icons text-gray-300 mr-2 mt-0.5">location_on</span>
                <span className="text-gray-300">123 Luxury Avenue, New York, NY 10001</span>
              </li>
              <li className="flex items-center">
                <span className="material-icons text-gray-300 mr-2">phone</span>
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <span className="material-icons text-gray-300 mr-2">email</span>
                <span className="text-gray-300">info@luxstayhotels.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center md:flex md:justify-between md:text-left">
          <p className="text-gray-400">© {new Date().getFullYear()} LuxStay Hotels. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <Link href="/privacy">
              <div className="text-gray-400 hover:text-white transition mx-2 inline-block">Privacy</div>
            </Link>
            <Link href="/terms">
              <div className="text-gray-400 hover:text-white transition mx-2 inline-block">Terms</div>
            </Link>
            <Link href="/sitemap">
              <div className="text-gray-400 hover:text-white transition mx-2 inline-block">Sitemap</div>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
