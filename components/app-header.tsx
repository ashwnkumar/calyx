import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";

export function AppHeader() {
  return (
    <nav className="w-full border-b border-b-foreground/10">
      <div className="max-w-5xl mx-auto flex justify-between items-center p-3 sm:p-4 px-4 sm:px-6">
        <Link href="/" className="font-semibold text-xl sm:text-2xl">
          Calyx
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeSwitcher />
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
