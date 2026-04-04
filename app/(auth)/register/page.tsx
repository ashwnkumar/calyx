import type { Metadata } from "next";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Create an account to start managing your encrypted environment variables securely.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
