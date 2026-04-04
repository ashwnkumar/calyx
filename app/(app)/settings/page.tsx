import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./settings-client";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account and security settings.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <PageTransition>
      <SettingsClient
        userEmail={user?.email ?? ""}
        userCreatedAt={user?.created_at ?? ""}
      />
    </PageTransition>
  );
}
