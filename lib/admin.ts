import { createClient } from "@/lib/supabase/server";

/**
 * Check if the currently authenticated user has is_admin = true.
 * Returns false if not logged in or profile not found.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return profile?.is_admin === true;
}
