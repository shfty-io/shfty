"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";

type Tag = {
  id: string;
  label: string;
};

type TagsSelectorProps = {
  tags: Tag[];
  selectedTags: Tag[];
  setSelectedTags: (tags: Tag[]) => void;
  title: string;
  maxTags?: number;
};

export function TagsSelector({ 
  tags, 
  selectedTags, 
  setSelectedTags, 
  title, 
  maxTags = Infinity 
}: TagsSelectorProps) {
  const selectedsContainerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const removeSelectedTag = (id: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag.id !== id));
  };

  const addSelectedTag = (tag: Tag) => {
    if (selectedTags.length < maxTags) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  useEffect(() => {
    if (selectedsContainerRef.current) {
      selectedsContainerRef.current.scrollTo({
        left: selectedsContainerRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  }, [selectedTags]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full flex flex-col relative z-[100]" ref={containerRef}>
      <motion.h2 layout className="text-sm font-medium mb-2">
        {title}
        {maxTags !== Infinity && (
          <span className="text-xs text-muted-foreground ml-2">
            (Select up to {maxTags})
          </span>
        )}
      </motion.h2>
      <motion.div
        className="w-full flex items-center justify-start gap-1.5 bg-background border h-10 rounded-md mb-1 overflow-x-auto p-1.5 no-scrollbar cursor-pointer"
        style={{
          borderColor: isOpen ? "hsl(var(--primary))" : undefined,
        }}
        ref={selectedsContainerRef}
        layout
        onClick={() => setIsOpen(true)}
      >
        {selectedTags.length === 0 && (
          <div className="flex justify-between items-center w-full px-2">
            <span className="text-sm text-muted-foreground">
              Select {title.toLowerCase()}
            </span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        )}
        {selectedTags.map((tag) => (
          <motion.div
            key={tag.id}
            className="flex items-center gap-1 pl-2 pr-1 py-0.5 bg-primary text-primary-foreground shadow-sm h-7 shrink-0 rounded-md"
            layoutId={`tag-${tag.id}`}
            initial={{ borderRadius: 6 }}
            animate={{ borderRadius: 6 }}
            exit={{ borderRadius: 6 }}
          >
            <motion.span
              layoutId={`tag-${tag.id}-label`}
              className="text-xs font-medium"
            >
              {tag.label}
            </motion.span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeSelectedTag(tag.id);
              }}
              className="p-0.5 rounded-full hover:bg-primary/80"
            >
              <X className="size-3" />
            </button>
          </motion.div>
        ))}
        {selectedTags.length > 0 && (
          <div className="ml-auto pr-2">
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        )}
      </motion.div>
      <p className="text-xs text-muted-foreground mt-1">
        {selectedTags.length > 0 
          ? `${selectedTags.length} selected${maxTags !== Infinity ? ` (max ${maxTags})` : ''}`
          : `Select ${title.toLowerCase()} for your product`}
      </p>
      <AnimatePresence>
        {isOpen && tags.length > 0 && (
          <motion.div
            className="bg-background shadow-md border w-full z-[100] absolute top-[calc(100%-10px)] left-0"
            style={{
              borderRadius: 8,
            }}
            initial={{ opacity: 0, y: -10, scaleY: 0.8 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div className="flex flex-wrap gap-2 p-3 max-h-[200px] overflow-y-auto">
              {tags
                .filter(
                  (tag) =>
                    !selectedTags.some((selected) => selected.id === tag.id)
                )
                .map((tag) => (
                  <motion.button
                    key={tag.id}
                    type="button"
                    layoutId={`tag-${tag.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-secondary hover:bg-secondary/80 shrink-0 rounded-full"
                    onClick={() => {
                      if (selectedTags.length < maxTags) {
                        addSelectedTag(tag);
                        if (selectedTags.length + 1 >= maxTags) {
                          setIsOpen(false);
                        }
                      }
                    }}
                    disabled={selectedTags.length >= maxTags}
                    initial={{ borderRadius: 9999 }}
                    animate={{ borderRadius: 9999 }}
                    exit={{ borderRadius: 9999 }}
                  >
                    <motion.span
                      layoutId={`tag-${tag.id}-label`}
                      className="text-sm"
                    >
                      {tag.label}
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