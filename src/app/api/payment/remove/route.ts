import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const methodId = formData.get("methodId") as string;

  if (!methodId) {
    return NextResponse.json(
      { error: "Payment method ID is required" },
      { status: 400 }
    );
  }

  // Delete the payment method
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', methodId)
    .eq('user_id', user.id); // Ensure the payment method belongs to the user

  if (error) {
    return NextResponse.json(
      { error: "Failed to remove payment method" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Payment method removed successfully" },
    { status: 200 }
  );
} 