'use client';

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onToggleSidebar: () => void;
  isOpen: boolean;
}

export function Header({ onToggleSidebar, isOpen }: HeaderProps) {
  return (
    <header className="w-full border-b bg-white sticky top-0 z-30">
      <div className="flex h-16 items-center px-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onToggleSidebar}
        >
          {isOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
    </header>
  )
}
