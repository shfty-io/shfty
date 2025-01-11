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
  const cardNumber = formData.get("cardNumber") as string;
  const expiry = formData.get("expiry") as string;
  const cvc = formData.get("cvc") as string;

  // Basic validation
  if (!cardNumber || !expiry || !cvc) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Format card data
  const last4 = cardNumber.slice(-4);
  const [expMonth, expYear] = expiry.split("/");

  // Store in payment_methods table
  const { error } = await supabase
    .from('payment_methods')
    .insert({
      user_id: user.id,
      last4,
      exp_month: expMonth,
      exp_year: expYear,
      // In a real app, you'd integrate with a payment provider like Stripe
      // and store their token/payment method ID instead of card details
    });

  if (error) {
    return NextResponse.json(
      { error: "Failed to save payment method" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Payment method added successfully" },
    { status: 200 }
  );
} 