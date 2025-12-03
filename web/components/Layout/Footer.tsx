import Link from 'next/link';
import { Printer, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Printer className="w-6 h-6 text-indigo-400" />
              <span className="text-xl font-bold text-white">Hall of Prints</span>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Professional printing services for businesses and individuals. Quality prints, fast turnaround, competitive prices.
            </p>
            {/* Social Media */}
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Products</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-sm hover:text-indigo-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm hover:text-indigo-400 transition-colors">
                  Banners & Signs
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm hover:text-indigo-400 transition-colors">
                  Business Cards
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm hover:text-indigo-400 transition-colors">
                  Marketing Materials
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm hover:text-indigo-400 transition-colors">
                  Custom Prints
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/upload-file" className="text-sm hover:text-indigo-400 transition-colors">
                  Upload Artwork
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm hover:text-indigo-400 transition-colors">
                  View Cart
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm hover:text-indigo-400 transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm hover:text-indigo-400 transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm hover:text-indigo-400 transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm">
                <Mail className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Email</p>
                  <a href="mailto:aresh@inteeka.com" className="hover:text-indigo-400 transition-colors">
                    aresh@inteeka.com
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3 text-sm">
                <Phone className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Phone</p>
                  <a href="tel:+447896993298" className="hover:text-indigo-400 transition-colors">
                    +44 7896 993 298
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3 text-sm">
                <MapPin className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Location</p>
                  <p>London, United Kingdom</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-sm text-gray-400">
              © {currentYear} Hall of Prints. All rights reserved.
            </p>
            
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/" className="text-gray-400 hover:text-indigo-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/" className="text-gray-400 hover:text-indigo-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/" className="text-gray-400 hover:text-indigo-400 transition-colors">
                Cookie Policy
              </Link>
              <Link href="/" className="text-gray-400 hover:text-indigo-400 transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
