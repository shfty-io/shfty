import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function POST() {
  const supabase = createClient(await cookies());
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Password reset email sent" },
    { status: 200 }
  );
} 