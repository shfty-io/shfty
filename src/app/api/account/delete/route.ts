import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Delete user's data from payment_methods table
  const { error: paymentError } = await supabase
    .from('payment_methods')
    .delete()
    .eq('user_id', user.id);

  if (paymentError) {
    return NextResponse.json(
      { error: "Failed to delete payment methods" },
      { status: 500 }
    );
  }

  // Delete user's auth account
  const { error } = await supabase.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.redirect(new URL("/auth/login", process.env.NEXT_PUBLIC_SITE_URL));
} 