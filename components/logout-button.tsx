"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.info("Logged out successfully");
    router.push("/");
  };

  return (
    <Button onClick={logout} size={"icon"}>
      <LogOut />
    </Button>
  );
}
