import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in to Calyx to access your encrypted secrets.",
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (user && !error) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      {/* Branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted/50 border-r flex-col justify-between p-10">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Calyx
        </Link>
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center size-12 rounded-lg bg-primary/10">
            <Shield className="size-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold leading-tight">
            Your .env files,
            <br />
            encrypted and accessible.
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-md">
            Zero-knowledge encryption means your secrets are encrypted in the
            browser before they ever touch the server. Only you can read them.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2026 Calyx — Built by{" "}
          <Link
            href="https://ashwinkumar-dev.vercel.app"
            className="hover:text-foreground"
          >
            Ashwin
          </Link>
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
