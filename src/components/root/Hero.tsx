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

  const getPrevIndex = (current: number) => {
    return current === 0 ? images.length - 1 : current - 1;
  };

  const getNextIndex = (current: number) => {
    return current === images.length - 1 ? 0 : current + 1;
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        <div className="relative h-[500px] w-full overflow-visible perspective-[1200px]">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Previous Image */}
            <div 
              className="absolute transform transition-all duration-700 ease-in-out"
              style={{
                transform: `rotateY(30deg) translateX(-60%) scale(0.85)`,
                opacity: 0.5,
                filter: 'blur(2px)',
                transformOrigin: 'right center'
              }}
            >
              <div className="relative h-[500px] w-[400px] bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={images[getPrevIndex(currentImageIndex)]}
                  alt="Previous"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Current Image */}
            <div 
              className="relative h-[500px] w-[400px] z-10 transform transition-all duration-700 ease-in-out"
              style={{
                transform: 'scale(1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div className="relative h-full w-full bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={images[currentImageIndex]}
                  alt="Current"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Next Image */}
            <div 
              className="absolute transform transition-all duration-700 ease-in-out"
              style={{
                transform: `rotateY(-30deg) translateX(60%) scale(0.85)`,
                opacity: 0.5,
                filter: 'blur(2px)',
                transformOrigin: 'left center'
              }}
            >
              <div className="relative h-[500px] w-[400px] bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={images[getNextIndex(currentImageIndex)]}
                  alt="Next"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 