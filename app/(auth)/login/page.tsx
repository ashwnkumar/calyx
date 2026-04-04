import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to access your encrypted environment variables securely.",
};

export default function Page() {
  return <LoginForm />;
}
