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
  const emailNotifications = formData.get("emailNotifications") === "on";

  const { error } = await supabase.auth.updateUser({
    data: {
      email_notifications: emailNotifications,
    },
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Notification preferences updated" },
    { status: 200 }
  );
} 