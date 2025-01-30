"use client";

import { Button } from "./button";
import { Github, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      setIsVisible(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50" />
        <div 
          className="absolute right-0 top-1/4 h-[1500px] w-[1500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 opacity-50 blur-3xl"
          aria-hidden="true"
        />
        <div 
          className="absolute left-0 top-3/4 h-[1500px] w-[1500px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 opacity-50 blur-3xl"
          aria-hidden="true"
        />
      </div>
      <div className="relative w-full max-w-[90rem] px-6 py-24 lg:px-16 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-12">
            <a href="https://www.producthunt.com" className="inline-flex space-x-6">
              <span className="rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold leading-6 text-orange-500 ring-1 ring-inset ring-orange-500/20">
                What&apos;s new
              </span>
              <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
                <span>Just launched on Product Hunt</span>
              </span>
            </a>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl lg:text-8xl">
            Your Marketplace for Digital Products
          </h1>
          <p className="mt-8 text-xl leading-8 text-gray-600 lg:text-2xl">
            Discover and purchase amazing digital products from creators around the world. From templates to tools, find everything you need to build your next project.
          </p>
          <div className="mt-16 flex flex-col items-center justify-center gap-8 sm:flex-row">
            <Button size="lg" onClick={handleClose} className="h-14 w-full text-lg sm:w-auto">
              Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="flex items-center gap-8">
              <a
                href="https://github.com/yourusername/yourrepo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-base font-semibold leading-6 text-gray-900 hover:text-gray-700"
              >
                <Github className="h-6 w-6" />
                Star on GitHub
              </a>
              <a
                href="https://www.producthunt.com/posts/your-product"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-base font-semibold leading-6 text-gray-900 hover:text-gray-700"
              >
                <img src="/producthunt.svg" alt="Product Hunt" className="h-6 w-6" />
                Like on Product Hunt
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 