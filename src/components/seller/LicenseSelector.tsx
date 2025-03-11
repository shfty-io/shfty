"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";

type License = {
  id: string;
  label: string;
};

type LicenseSelectorProps = {
  licenses: License[];
  selectedLicense: License | null;
  setSelectedLicense: (license: License | null) => void;
  onOpenChange?: (isOpen: boolean) => void;
};

export function LicenseSelector({ 
  licenses, 
  selectedLicense, 
  setSelectedLicense, 
  onOpenChange
}: LicenseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const clearSelectedLicense = () => {
    setSelectedLicense(null);
  };

  const selectLicense = (license: License) => {
    setSelectedLicense(license);
    setIsOpen(false);
    onOpenChange?.(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onOpenChange]);

  // Call onOpenChange when isOpen changes
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div 
      className={`w-full flex flex-col relative ${isOpen ? 'z-[200]' : 'z-0'}`} 
      ref={containerRef}
    >
      <motion.div
        className="w-full flex items-center justify-start gap-1.5 bg-background border h-10 rounded-md mb-1 overflow-x-auto p-1.5 no-scrollbar cursor-pointer"
        style={{
          borderColor: isOpen ? "hsl(var(--primary))" : undefined,
        }}
        layout
        onClick={toggleDropdown}
      >
        {!selectedLicense && (
          <div className="flex justify-between items-center w-full px-2">
            <span className="text-sm text-muted-foreground">
              Select a software license
            </span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        )}
        {selectedLicense && (
          <>
            <motion.div
              className="flex items-center gap-1 pl-2 pr-1 py-0.5 bg-primary text-primary-foreground shadow-sm h-7 shrink-0 rounded-md"
              layoutId={`license-${selectedLicense.id}`}
              initial={{ borderRadius: 6 }}
              animate={{ borderRadius: 6 }}
              exit={{ borderRadius: 6 }}
            >
              <motion.span
                layoutId={`license-${selectedLicense.id}-label`}
                className="text-xs font-medium"
              >
                {selectedLicense.label}
              </motion.span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelectedLicense();
                }}
                className="p-0.5 rounded-full hover:bg-primary/80"
              >
                <X className="size-3" />
              </button>
            </motion.div>
            <div className="ml-auto pr-2">
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </>
        )}
      </motion.div>
      <AnimatePresence>
        {isOpen && licenses.length > 0 && (
          <motion.div
            className="bg-background shadow-md border w-full z-[200] absolute top-[calc(100%-10px)] left-0 pointer-events-auto"
            style={{
              borderRadius: 8,
            }}
            initial={{ opacity: 0, y: -10, scaleY: 0.8 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.8, pointerEvents: 'none' }}
            transition={{ duration: 0.15 }}
          >
            <motion.div className="flex flex-col gap-1 p-3 max-h-[200px] overflow-y-auto">
              {licenses.map((license) => (
                <motion.button
                  key={license.id}
                  type="button"
                  className={`flex items-center gap-1 px-3 py-2 hover:bg-secondary/80 shrink-0 rounded-md text-left ${
                    selectedLicense?.id === license.id ? 'bg-secondary' : ''
                  }`}
                  onClick={() => selectLicense(license)}
                >
                  <motion.span className="text-sm">
                    {license.label}
                  </motion.span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 