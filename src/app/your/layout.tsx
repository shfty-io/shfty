import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { Sidebar } from "@/components/your/sidebar";

export default async function YourLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return redirect('/auth/login');
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
