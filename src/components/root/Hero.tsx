'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const images = [
  '/hero1.png',
  '/hero2.png',
  '/hero3.png',
];

const categories = [
  'All',
  '3D',
  'AI',
  'Agency',
  'Animated',
  'App',
  'Blog',
  'Brand Guidelines',
  'Business',
  'Changelog',
  'Documentation',
  'Ecommerce',
  'Education',
  'Entertainment',
  'Food',
  'Free',
  'Health',
  'Landing Page',
  'Membership',
  'Minimal',
  'Modern',
  'New',
  'News',
  'Personal',
  'Photography',
  'Podcast',
  'Portfolio',
  'Real Estate',
  'Restaurant',
  'Resume',
  'SaaS',
  'Sidebar',
  'Splash',
  'Startup',
  'Tech',
  'Web3'
];

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
              MEMBERSHIP TEMPLATE
            </p>
            <h1 className="text-5xl font-bold leading-tight mb-4">
              Meet the new home<br />
              for your digital goods
            </h1>
            <p className="text-xl text-gray-600">
              Sell exclusive access to your digital goods<br />
              all in your Framer CMS site
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category}
                href={category === 'All' ? '/' : `/category/${category.toLowerCase().replace(/ /g, '-')}`}
                className={`px-4 py-2 rounded-full text-sm font-medium
                  ${category === 'All' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Content - Image Carousel */}
        <div className="relative h-[500px] w-full">
          {images.map((src, index) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out
                ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className="relative h-full w-full bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={src}
                  alt={`Monster ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full text-sm">
                  All Tickles
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 