'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Profile", href: "/your/profile" },
  { name: "Account", href: "/your/account" },
  { name: "Payment", href: "/your/payment" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-gray-50 border-r">
      <div className="p-4">
        <h2 className="text-xl font-semibold">Your Account</h2>
      </div>
      <nav className="flex-1">
        <ul className="space-y-1 p-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm rounded-md",
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
  );
}
