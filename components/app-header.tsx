"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Settings,
  LogOut,
  Lock,
  LockOpen,
  Key,
  Menu,
  User,
  ChevronDown,
  type LucideIcon,
  LayoutDashboard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useSecrets } from "@/lib/contexts/SecretContext";
import { SetupDialog } from "@/components/setup-dialog";
import { UnlockDialog } from "@/components/unlock-dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────── */

const NAV_ICONS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
];

const SHEET_LINKS: { href: string; label: string; icon?: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/", label: "Home", icon: Home },
];

/* ────────────────────────────────────────────────────────────── */

function NavIcon({
  href,
  label,
  Icon,
  isActive,
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
  isActive: boolean;
}) {
  return (
    <Button
      asChild
      variant={isActive ? "default" : "ghost"}
      size="icon"
      aria-label={label}
      className={cn(
        "size-9 transition relative",
        !isActive && "text-muted-foreground hover:text-foreground",
      )}
    >
      <Link href={href}>
        <Icon className="size-4" />
      </Link>
    </Button>
  );
}

/* ────────────────────────────────────────────────────────────── */

export function AppHeader({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const { isPassphraseSetup, isUnlocked, lock } = useSecrets();

  const [setupOpen, setSetupOpen] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  /* ───────────── Actions ───────────── */

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.info("Logged out successfully");
    router.push("/");
  };

  const handleLockToggle = () => {
    if (!isPassphraseSetup) setSetupOpen(true);
    else if (isUnlocked) lock();
    else setUnlockOpen(true);
  };

  /* ───────────── Derived State ───────────── */

  const lockLabel = !isPassphraseSetup
    ? "Setup"
    : isUnlocked
      ? "Unlocked"
      : "Locked";

  const LockIcon = !isPassphraseSetup ? Key : isUnlocked ? LockOpen : Lock;

  /* ───────────────────────────────────── */

  return (
    <>
      <nav className="w-full border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          {/* Left: Logo + Lock */}
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="font-medium text-2xl tracking-tight"
            >
              Calyx
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLockToggle}
              className={cn(
                "gap-1.5 h-7 text-xs px-2.5",
                isUnlocked &&
                  "border-green-500/40 text-green-700 dark:text-green-400 hover:bg-green-500/10",
              )}
            >
              <LockIcon className="size-3" />
              {lockLabel}
            </Button>
          </div>

          {/* Center: Desktop Nav */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_ICONS.map(({ href, label, icon }) => (
              <NavIcon
                key={href}
                href={href}
                label={label}
                Icon={icon}
                isActive={pathname.startsWith(href)}
              />
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Desktop: Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex gap-2 h-8 pl-2 pr-2.5"
                >
                  <div className="flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary">
                    <User className="size-3" />
                  </div>
                  <span className="text-xs max-w-[130px] truncate">
                    {userEmail}
                  </span>
                  <ChevronDown className="size-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-xs text-muted-foreground truncate">
                    {userEmail}
                  </p>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="size-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-muted-foreground focus:text-foreground"
                >
                  <LogOut className="size-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile: Sheet Menu */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="sm:hidden"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-1 mt-4">
                  <p className="text-xs text-muted-foreground px-3 mb-2 truncate">
                    {userEmail}
                  </p>

                  {SHEET_LINKS.map(({ href, label, icon: Icon }) => (
                    <Button
                      key={href}
                      asChild
                      variant="ghost"
                      className="justify-start"
                      onClick={() => setSheetOpen(false)}
                    >
                      <Link href={href}>
                        {Icon && <Icon className="size-4 mr-2" />}
                        {label}
                      </Link>
                    </Button>
                  ))}

                  <div className="border-t mt-2 pt-2">
                    <Button
                      variant="ghost"
                      className="justify-start w-full text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setSheetOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="size-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Passphrase Banner */}
      {!isPassphraseSetup && (
        <div className="border-b bg-muted/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Key className="size-4 text-primary" />
              <span>Set up your master passphrase to encrypt your secrets</span>
            </div>
            <Button onClick={() => setSetupOpen(true)} size="sm">
              Set Up Passphrase
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <SetupDialog open={setupOpen} onOpenChange={setSetupOpen} />
      <UnlockDialog open={unlockOpen} onOpenChange={setUnlockOpen} />
    </>
  );
}
