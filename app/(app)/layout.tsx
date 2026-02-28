import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { SecretProvider } from "@/lib/contexts/SecretContext";
import { PassphraseStatusAlert } from "@/components/passphrase-status-alert";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  noStore();

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // If user is not logged in, redirect to login
  if (error || !user) {
    redirect("/auth/login");
  }

  return (
    <SecretProvider>
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4">
          <PassphraseStatusAlert />
          {children}
        </main>
        <AppFooter />
      </div>
    </SecretProvider>
  );
}
