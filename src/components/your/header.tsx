'use client';

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export function Header() {
  const { toggleSidebar, state } = useSidebar();

  return (
    <header className="w-full border-b bg-white sticky top-0">
      <div className="flex h-16 items-center px-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleSidebar}
          className="mr-2"
        >
          {state === "expanded" ? (
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
