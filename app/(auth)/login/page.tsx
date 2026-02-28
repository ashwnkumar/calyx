import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to access your encrypted environment variables securely.",
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full flex-col">
      {/* Header */}
      <nav className="w-full border-b border-b-foreground/10">
        <div className="max-w-5xl mx-auto flex justify-between items-center p-3 sm:p-4 px-4 sm:px-6">
          <Link href="/" className="font-semibold text-xl sm:text-2xl">
            Calyx
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/about">
                <Info className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">About</span>
              </Link>
            </Button>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
