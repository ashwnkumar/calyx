import type { Metadata } from "next";
import Link from "next/link";
import {
  Lock,
  Shield,
  Zap,
  FileKey,
  Download,
  Clock,
  History,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Calyx - A personal, zero-knowledge secrets manager for environment variables built to solve the lost .env files problem.",
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Calyx
            </Link>
            {user ? (
              <Button asChild size="sm">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-secondary/5" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Calyx
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              A personal, zero-knowledge secrets manager for environment
              variables
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href={user ? "/dashboard" : "/register"}>
                  {user ? "Go to Dashboard" : "Get Started"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link
                  href="https://github.com/ashwnkumar/calyx"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* The Problem */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            The Problem I Was Solving
          </h2>
          <div className="space-y-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            <p>
              You know that moment when you clone your project on a new device,
              run{" "}
              <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono">
                npm install
              </code>
              , fire up the dev server, and... nothing works? Then you realize
              you need to hunt down all those{" "}
              <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono">
                .env
              </code>{" "}
              files from Slack messages, old laptops, or that one Google Doc you
              created 6 months ago.
            </p>
            <p>Yeah, I got tired of that too.</p>
            <p>
              So I built Calyx — a simple, secure way to store and access my
              environment variables across all my devices without ever exposing
              them to the server. No more searching through chat history or USB
              drives. Just unlock, copy, and you&apos;re back to coding.
            </p>
          </div>
        </section>

        {/* What Makes It Different */}
        <section className="bg-muted/40 border-y">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8">
              What Makes It Different?
            </h2>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <Card className="bg-card hover:shadow-md">
                <CardContent className="pt-6 space-y-3">
                  <div className="inline-flex items-center justify-center size-10 rounded-lg bg-primary/10">
                    <Shield className="size-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    Zero-Knowledge Architecture
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your secrets are encrypted in your browser before they ever
                    touch the server. I literally can&apos;t read them even if I
                    wanted to. The encryption key is derived from your
                    passphrase and lives only in memory — it&apos;s gone the
                    moment you close the tab.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card hover:shadow-md">
                <CardContent className="pt-6 space-y-3">
                  <div className="inline-flex items-center justify-center size-10 rounded-lg bg-primary/10">
                    <Zap className="size-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    Built for Developers
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Copy individual variables, download entire{" "}
                    <code className="px-1 py-0.5 bg-muted rounded text-xs font-mono">
                      .env
                    </code>{" "}
                    files, or grab everything as encrypted backups. It works the
                    way you work.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card hover:shadow-md">
                <CardContent className="pt-6 space-y-3">
                  <div className="inline-flex items-center justify-center size-10 rounded-lg bg-primary/10">
                    <Lock className="size-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">Actually Secure</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    AES-GCM-256 encryption, PBKDF2 key derivation with 350,000
                    iterations, unique IVs for every encryption, and auto-lock
                    after 30 minutes of inactivity. Your secrets stay secret.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card hover:shadow-md">
                <CardContent className="pt-6 space-y-3">
                  <div className="inline-flex items-center justify-center size-10 rounded-lg bg-primary/10">
                    <History className="size-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    Version Control Built-In
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Every change is automatically tracked. View complete version
                    history, see line-by-line diffs between versions, and
                    restore previous versions with one click. Your audit trail
                    is always encrypted.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: "Client-side encryption",
                desc: "Your passphrase never leaves your browser",
              },
              {
                icon: FileKey,
                title: "Multiple projects",
                desc: "Organize env files by project",
              },
              {
                icon: FileKey,
                title: "Multiple environments",
                desc: "Store dev, staging, prod files separately",
              },
              {
                icon: Download,
                title: "Download options",
                desc: "Get your .env files in original format",
              },
              {
                icon: Clock,
                title: "Smart locking",
                desc: "Auto-lock on inactivity or tab switch",
              },
              {
                icon: History,
                title: "Version control",
                desc: "Track changes and restore previous versions",
              },
             
            ].map((feature) => (
              <div key={feature.title} className="flex gap-3">
                <div className="shrink-0 mt-0.5">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-muted/40 border-y">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
              How It Works
            </h2>
            <div className="grid sm:grid-cols-4 gap-8">
              {[
                {
                  step: "1",
                  title: "Sign in",
                  desc: "Supabase authentication",
                },
                {
                  step: "2",
                  title: "Add projects",
                  desc: "Create projects & paste your .env files",
                },
                {
                  step: "3",
                  title: "Set passphrase",
                  desc: "One master passphrase, first time only",
                },
                {
                  step: "4",
                  title: "Unlock & use",
                  desc: "Decrypt in-browser, copy or download, then lock",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="inline-flex items-center justify-center size-10 rounded-full bg-primary text-primary-foreground font-bold text-sm mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Details */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Security Details
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm sm:text-base">
                {[
                  ["Encryption", "AES-GCM-256 (industry standard)"],
                  ["Key Derivation", "PBKDF2-SHA256 with 350,000 iterations"],
                  ["Salt", "16 random bytes per user (stored in database)"],
                  ["IV", "12 random bytes per encryption (never reused)"],
                  ["Key Storage", "In-memory only (React Context)"],
                  [
                    "Passphrase Verification",
                    "Test ciphertext stored in database",
                  ],
                  [
                    "Auto-lock",
                    "30 minutes of inactivity or tab visibility change",
                  ],
                  [
                    "RLS Policies",
                    "Row-level security ensures you only see your own data",
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="py-1">
                    <span className="font-semibold text-foreground">
                      {label}:
                    </span>{" "}
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tech Stack */}
        <section className="bg-muted/40 border-y">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Tech Stack</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base">
              {[
                ["Framework", "Next.js 15"],
                ["Language", "TypeScript"],
                ["Styling", "Tailwind CSS v4"],
                ["UI Components", "shadcn/ui"],
                ["Authentication", "Supabase Auth"],
                ["Database", "Supabase (PostgreSQL)"],
                ["Encryption", "Web Crypto API"],
                ["State Management", "React Context"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between p-3 bg-background rounded-lg border"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Calyx */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Why &ldquo;Calyx&rdquo;?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            A calyx is the protective outer layer of a flower bud — it shields
            what&apos;s inside until it&apos;s ready to bloom. Seemed fitting
            for a secrets manager. 🌸
          </p>
        </section>

        {/* CTA */}
        <section className="border-t bg-muted/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-6">
              Stop hunting for your .env files and start managing them securely.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href={user ? "/dashboard" : "/register"}>
                  {user ? "Go to Dashboard" : "Get Started"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link
                  href="https://github.com/ashwnkumar/calyx"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            Made with ☕ by{" "}
            <Link
              href="https://ashwinkumar-dev.vercel.app"
              className="text-primary hover:underline"
            >
              Ashwin
            </Link>{" "}
            because I was tired of losing my .env files.
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/ashwnkumar/calyx"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </Link>
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
