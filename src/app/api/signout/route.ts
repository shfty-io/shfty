// This file is already correct as it only uses auth operations
// No database operations are being performed, so it doesn't need the service client

import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function POST() {
  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.redirect(new URL("/auth/login", process.env.NEXT_PUBLIC_SITE_URL));
} 