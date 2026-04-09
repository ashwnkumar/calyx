"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { User, Shield, Sun, Moon, Laptop, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChangePassphraseDialog } from "@/components/change-passphrase-dialog";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";

type SettingsClientProps = {
  userEmail: string;
  userCreatedAt: string;
};

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
] as const;

export function SettingsClient({
  userEmail,
  userCreatedAt,
}: SettingsClientProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formattedDate = userCreatedAt
    ? new Date(userCreatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and security settings
        </p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-4" />
            Account
          </CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Member since</p>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-4" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your master passphrase and encryption settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Master Passphrase</p>
              <p className="text-sm text-muted-foreground">
                Change the passphrase used to encrypt all your secrets
              </p>
            </div>
            <ChangePassphraseDialog />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="size-4" />
            Appearance
          </CardTitle>
          <CardDescription>Choose your preferred theme</CardDescription>
        </CardHeader>
        <CardContent>
          {mounted ? (
            <div className="flex gap-2">
              {themeOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={theme === opt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme(opt.value)}
                  className="gap-1.5"
                >
                  <opt.icon className="size-3.5" />
                  {opt.label}
                </Button>
              ))}
            </div>
          ) : (
            <div className="h-9" />
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions — proceed with caution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Export Data</p>
              <p className="text-sm text-muted-foreground">
                Download all your encrypted data as a backup
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Coming soon
            </Button>
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">
                  Delete Account
                </p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all encrypted data
                </p>
              </div>
              <DeleteAccountDialog userEmail={userEmail} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
