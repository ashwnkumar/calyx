import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { SecretProvider } from "@/lib/contexts/SecretContext";
import { ProductTour } from "@/components/product-tour";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your encrypted environment variables and projects.",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin === true;

  return (
    <SecretProvider>
      <div className="min-h-screen flex flex-col">
        <AppHeader userEmail={user.email ?? ""} isAdmin={isAdmin} />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4">
          {children}
        </main>
        <AppFooter />
      </div>
      <ProductTour />
    </SecretProvider>
  );
}
