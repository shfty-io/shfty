'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Footer() {
  const [year, setYear] = useState('');
  const { isSidebarOpen } = useSidebar();
  const pathname = usePathname();
  const isYourPage = pathname?.startsWith('/your');

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <footer className={cn(
      "bg-gray-100 border-t",
      "transition-[margin] duration-300 ease-in-out",
      isYourPage && isSidebarOpen ? "ml-64" : "ml-0"
    )}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">Software Marketplace</h3>
            <p className="text-gray-600">
              The place to buy and sell quality software products.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/your/listings" className="text-gray-600 hover:text-gray-900">
                  Your Listings
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <p className="text-gray-600">
              Have questions? Contact us at{' '}
              <a href="mailto:support@softwaremarketplace.com" className="text-blue-600 hover:text-blue-800">
                support@softwaremarketplace.com
              </a>
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-gray-600">
          <p>&copy; {year} Software Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 