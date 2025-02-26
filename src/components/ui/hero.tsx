"use client";

import { Button } from "./button";
import { Github, ArrowRight, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export function Hero() {
  // Always visible
  const [isVisible, setIsVisible] = useState(true);
  const [showMission, setShowMission] = useState(false);

  const handleClose = () => {
    setIsVisible(false);
  };

  const toggleMission = () => {
    setShowMission(!showMission);
  };

  // Only hide when explicitly closed
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
          <div className="mb-12 flex justify-center">
            <Button 
              onClick={toggleMission} 
              variant="outline" 
              className="group flex items-center gap-2 transition-all hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300"
            >
              <Info className="h-4 w-4" />
              <span className="font-medium">Our Mission</span>
              {showMission ? 
                <ChevronUp className="h-4 w-4 transition-transform group-hover:translate-y-[-2px]" /> : 
                <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-[2px]" />
              }
            </Button>
          </div>
          
          {!showMission && (
            <>
              <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl lg:text-8xl">
                Your Marketplace for Digital Products
              </h1>
              
              <p className="mt-8 text-xl leading-8 text-gray-600 lg:text-2xl">
                Discover and purchase amazing digital products from creators around the world. From templates to tools, find everything you need to build your next project.
              </p>
            </>
          )}
          
          {showMission && (
            <div className="mt-8 bg-blue-50 p-8 rounded-lg border border-blue-100 text-left animate-in fade-in slide-in-from-top-4 duration-300 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">
                It&apos;s Time for a Restart
              </h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-5 rounded-lg shadow-md">
                  <p className="text-xl font-medium leading-relaxed">
                    Software must return to its rightful owners: <span className="font-bold">the business and the consumer</span>.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Why I Created shfty</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">1</span>
                      <span>To give failed startups new life as templates others can build upon</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">2</span>
                      <span>To free small businesses and consumers from endless subscription fees by giving them ownership</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">3</span>
                      <span>To help creators make a living by selling their software and website templates</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mt-2">
                  <p className="text-gray-700">
                    Help make this vision a reality by starring us on GitHub and supporting us on Product Hunt.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className={`${showMission ? 'mt-8' : 'mt-16'} flex flex-col items-center justify-center gap-8 sm:flex-row`}>
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
                <Image src="/producthunt.svg" alt="Product Hunt" width={24} height={24} className="h-6 w-6" />
                Like on Product Hunt
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 