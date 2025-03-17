"use client";

import { useEffect, useState } from "react";
import { Hero } from "./hero";

export function HeroWrapper() {
  const [mounted, setMounted] = useState(false);
  const [shouldShowHero, setShouldShowHero] = useState(false);

  useEffect(() => {
    // Only run this on the client side
    setMounted(true);
    
    try {
      // Check if this is the first visit or if the hero has been closed
      const hasVisited = localStorage.getItem('hasVisitedBefore');
      const hasClosedHero = localStorage.getItem('hasClosedHero');
      
      if (!hasVisited) {
        // First time visitor - show the hero and mark as visited
        setShouldShowHero(true);
        localStorage.setItem('hasVisitedBefore', 'true');
      } else if (hasClosedHero === 'true') {
        // Returning visitor who has closed the hero - don't show it
        setShouldShowHero(false);
      } else {
        // Returning visitor who hasn't closed the hero yet
        setShouldShowHero(true);
      }
    } catch (error) {
      // Handle localStorage errors (e.g., in private browsing mode)
      console.error("Error accessing localStorage:", error);
    }
  }, []);

  const handleClose = () => {
    setShouldShowHero(false);
    
    try {
      // Store that the user has closed the hero
      localStorage.setItem('hasClosedHero', 'true');
    } catch (error) {
      console.error("Error setting localStorage:", error);
    }
  };

  // Only render Hero component after client-side hydration
  if (!mounted) {
    return null;
  }

  return shouldShowHero ? <Hero onClose={handleClose} /> : null;
} 