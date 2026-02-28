import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/register-form";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Create an account to start managing your encrypted environment variables securely.",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
