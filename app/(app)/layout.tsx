import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  // If user is not logged in, redirect to login
  if (error || !user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 max-w-5xl w-full mx-auto p-6">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
