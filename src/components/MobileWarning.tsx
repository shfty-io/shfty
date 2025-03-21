"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { useState, useEffect } from "react"

export function MobileWarning() {
  const isMobile = useIsMobile()
  const [isDismissed, setIsDismissed] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  
  // Use effect to delay showing the warning to prevent hydration issues
  useEffect(() => {
    if (isMobile && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isMobile, isDismissed])
  
  // Store dismissed state in localStorage to prevent showing again
  const handleDismiss = () => {
    setIsDismissed(true)
    try {
      localStorage.setItem('mobile-warning-dismissed', 'true')
    } catch (e) {
      console.error('Failed to save dismissed state', e)
    }
  }
  
  // Check localStorage on mount
  useEffect(() => {
    try {
      const wasDismissed = localStorage.getItem('mobile-warning-dismissed') === 'true'
      if (wasDismissed) {
        setIsDismissed(true)
      }
    } catch (e) {
      console.error('Failed to read dismissed state', e)
    }
  }, [])
  
  if (!isMobile || !isVisible || isDismissed) return null
  
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-gray-900 m-4 p-6 rounded-lg max-w-md text-center shadow-xl">
        <h2 className="text-xl font-bold mb-2">Desktop Experience Recommended</h2>
        <p className="mb-4">This site is optimized for larger screens. Please visit us on a desktop or tablet for the best experience.</p>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          onClick={handleDismiss}
        >
          Continue Anyway
        </button>
      </div>
    </div>
  )
} 