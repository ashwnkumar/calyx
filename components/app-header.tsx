import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { Info } from "lucide-react";

export function AppHeader() {
  return (
    <nav className="w-full border-b border-b-foreground/10">
      <div className="max-w-5xl mx-auto flex justify-between items-center p-3 sm:p-4 px-4 sm:px-6">
        <Link href="/dashboard" className="font-semibold text-xl sm:text-2xl">
          Calyx
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <Info className="size-4 sm:mr-2" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
          <ThemeSwitcher />
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
