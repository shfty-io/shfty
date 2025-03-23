import { createClient, createServiceClient } from "@/lib/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const serviceClient = createServiceClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const emailNotifications = formData.get("emailNotifications") === "on";

  const { error } = await serviceClient
    .from('profiles')
    .update({
      email_notifications_enabled: emailNotifications,
    })
    .eq('id', user.id);

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