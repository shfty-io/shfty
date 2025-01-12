'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

const navigation = [
  { name: "Profile", href: "/your/profile" },
  { name: "Account", href: "/your/account" },
  { name: "Payment", href: "/your/payment" },
  { name: "Sell", href: "/your/sell" },
];

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn(
      "h-screen bg-gray-50 border-r flex",
      "transition-all duration-300 ease-in-out",
      isOpen ? "w-64" : "w-0"
    )}>
      <div className={cn(
        "flex flex-col min-w-[256px]",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="h-16 shrink-0 px-4 border-b flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-gray-900 flex items-center justify-center">
              <span className="text-white text-xs font-medium">AI</span>
            </div>
            <div>
              <div className="font-semibold">Marketplace</div>
              <div className="text-xs text-gray-500">Settings</div>
            </div>
          </Link>
        </div>

        {/* Main Navigation - Make it scrollable */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-xs font-medium text-gray-500 mb-2">Settings</div>
          <nav>
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-md",
                      pathname === item.href
                        ? "bg-gray-200 text-gray-900"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t p-3">
          <Link
            href="/feedback"
            className="flex items-center px-3 py-2 text-sm rounded-md text-gray-600 hover:bg-gray-100"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
          </Link>
        </div>
      </div>
    </div>
  );
}
