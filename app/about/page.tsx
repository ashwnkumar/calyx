import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  Shield,
  Zap,
  FileKey,
  Download,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Calyx - a personal, zero-knowledge secrets manager for environment variables built to solve the lost .env files problem.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl sm:text-2xl font-bold">
              Calyx
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="size-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            About Calyx
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            A personal, zero-knowledge secrets manager for environment variables
          </p>
        </section>

        {/* The Problem */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold">
            The Problem I Was Solving
          </h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              You know that moment when you clone your project on a new device,
              run{" "}
              <code className="px-2 py-1 bg-muted rounded text-sm">
                npm install
              </code>
              , fire up the dev server, and... nothing works? Then you realize
              you need to hunt down all those{" "}
              <code className="px-2 py-1 bg-muted rounded text-sm">.env</code>{" "}
              files from Slack messages, old laptops, or that one Google Doc you
              created 6 months ago.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Yeah, I got tired of that too.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              So I built Calyx - a simple, secure way to store and access my
              environment variables across all my devices without ever exposing
              them to the server. No more searching through chat history or USB
              drives. Just unlock, copy, and you're back to coding.
            </p>
          </div>
        </section>

        {/* What Makes It Different */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">
            What Makes It Different?
          </h2>
          <div className="grid gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5 text-primary" />
                  Zero-Knowledge Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your secrets are encrypted in your browser before they ever
                  touch the server. I literally can't read them even if I wanted
                  to. The encryption key is derived from your passphrase and
                  lives only in memory - it's gone the moment you close the tab.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="size-5 text-primary" />
                  Built for Developers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Copy individual variables, download entire{" "}
                  <code className="px-2 py-1 bg-muted rounded text-sm">
                    .env
                  </code>{" "}
                  files, or grab everything as encrypted backups. It works the
                  way you work.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="size-5 text-primary" />
                  Actually Secure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AES-GCM-256 encryption, PBKDF2 key derivation with 350,000
                  iterations, unique IVs for every encryption, and auto-lock
                  after 30 minutes of inactivity. Your secrets stay secret.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Features</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <Lock className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Client-side encryption</h3>
                <p className="text-sm text-muted-foreground">
                  Your passphrase never leaves your browser
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <FileKey className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Multiple projects</h3>
                <p className="text-sm text-muted-foreground">
                  Organize env files by project
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <FileKey className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Multiple environments</h3>
                <p className="text-sm text-muted-foreground">
                  Store dev, staging, prod files separately
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Download className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Download options</h3>
                <p className="text-sm text-muted-foreground">
                  Get your .env files in original format
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Smart locking</h3>
                <p className="text-sm text-muted-foreground">
                  Auto-lock on inactivity or tab switch
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Zap className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Fully responsive</h3>
                <p className="text-sm text-muted-foreground">
                  Works on mobile, tablet, and desktop
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">How It Works</h2>
          <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
            <li className="text-base sm:text-lg">
              Sign in with Supabase authentication
            </li>
            <li className="text-base sm:text-lg">
              Create a project (e.g., "My Awesome App")
            </li>
            <li className="text-base sm:text-lg">
              Add environment files (paste your .env content)
            </li>
            <li className="text-base sm:text-lg">
              Set up your passphrase (first time only)
            </li>
            <li className="text-base sm:text-lg">
              Unlock when needed - Your secrets decrypt in the browser
            </li>
            <li className="text-base sm:text-lg">
              Copy or download - Get your env vars back instantly
            </li>
            <li className="text-base sm:text-lg">
              Lock when done - Encryption key is cleared from memory
            </li>
          </ol>
        </section>

        {/* Security Details */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Security Details</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>
                  <span className="font-semibold text-foreground">
                    Encryption:
                  </span>{" "}
                  AES-GCM-256 (industry standard)
                </li>
                <li>
                  <span className="font-semibold text-foreground">
                    Key Derivation:
                  </span>{" "}
                  PBKDF2-SHA256 with 350,000 iterations
                </li>
                <li>
                  <span className="font-semibold text-foreground">Salt:</span>{" "}
                  16 random bytes per user (stored in database)
                </li>
                <li>
                  <span className="font-semibold text-foreground">IV:</span> 12
                  random bytes per encryption (never reused)
                </li>
                <li>
                  <span className="font-semibold text-foreground">
                    Key Storage:
                  </span>{" "}
                  In-memory only (React Context)
                </li>
                <li>
                  <span className="font-semibold text-foreground">
                    Passphrase Verification:
                  </span>{" "}
                  Test ciphertext stored in database
                </li>
                <li>
                  <span className="font-semibold text-foreground">
                    Auto-lock:
                  </span>{" "}
                  30 minutes of inactivity or tab visibility change
                </li>
                <li>
                  <span className="font-semibold text-foreground">
                    RLS Policies:
                  </span>{" "}
                  Row-level security ensures you only see your own data
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Tech Stack */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Tech Stack</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm sm:text-base">
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Framework</span>
              <span className="font-semibold">Next.js 15</span>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Language</span>
              <span className="font-semibold">TypeScript</span>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Styling</span>
              <span className="font-semibold">Tailwind CSS v4</span>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">UI Components</span>
              <span className="font-semibold">shadcn/ui</span>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Authentication</span>
              <span className="font-semibold">Supabase Auth</span>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Database</span>
              <span className="font-semibold">Supabase (PostgreSQL)</span>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Encryption</span>
              <span className="font-semibold">Web Crypto API</span>
            </div>
            <div className="flex justify-between p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">State Management</span>
              <span className="font-semibold">React Context</span>
            </div>
          </div>
        </section>

        {/* Why Calyx */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold">Why "Calyx"?</h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            A calyx is the protective outer layer of a flower bud - it shields
            what's inside until it's ready to bloom. Seemed fitting for a
            secrets manager. 🌸
          </p>
        </section>

        {/* CTA */}
        <section className="text-center py-8 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground">
            Stop hunting for your .env files and start managing them securely.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/login">Get Started</Link>
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
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-muted-foreground">
          <p>
            Made with ☕ by Ashwin because I was tired of losing my .env files.
          </p>
        </div>
      </footer>
    </div>
  );
}
