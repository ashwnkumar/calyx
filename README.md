# 🔐 Calyx

> A personal, zero-knowledge secrets manager for environment variables

## The Problem I Was Solving

You know that moment when you clone your project on a new device, run `npm install`, fire up the dev server, and... nothing works? Then you realize you need to hunt down all those `.env` files from Slack messages, old laptops, or that one Google Doc you created 6 months ago.

Yeah, I got tired of that too.

So I built Calyx - a simple, secure way to store and access my environment variables across all my devices without ever exposing them to the server. No more searching through chat history or USB drives. Just unlock, copy, and you're back to coding.

## What Makes It Different?

**Zero-Knowledge Architecture**: Your secrets are encrypted in your browser before they ever touch my server. I literally can't read them even if I wanted to. The encryption key is derived from your passphrase and lives only in memory - it's gone the moment you close the tab.

**Built for Developers**: Copy individual variables, download entire `.env` files, or grab everything as encrypted backups. It works the way you work.

**Actually Secure**: AES-GCM-256 encryption, PBKDF2 key derivation with 350,000 iterations, unique IVs for every encryption, and auto-lock after 30 minutes of inactivity. Your secrets stay secret.

## Features

- 🔒 **Client-side encryption** - Your passphrase never leaves your browser
- 📁 **Multiple projects** - Organize env files by project (frontend, backend, production, etc.)
- 📝 **Multiple environments** - Store different env files per project (dev, staging, prod)
- 📋 **Quick copy** - Copy individual variables or entire files
- 💾 **Download options** - Get your `.env` files back in their original format
- 🔓 **Smart locking** - Auto-lock on inactivity or when you switch tabs
- 📜 **Version control** - Track changes to your env files with full history
- 🔍 **Diff view** - See exactly what changed between versions
- ⏮️ **Version restore** - Roll back to any previous version
- 🎨 **Clean UI** - Built with shadcn/ui and Tailwind CSS
- 📱 **Fully responsive** - Works on mobile, tablet, and desktop

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL with RLS)
- **Encryption**: Web Crypto API (AES-GCM-256 + PBKDF2-SHA256)
- **State Management**: React Context (no external libraries)

## How It Works

1. **Sign in** with Supabase authentication
2. **Create a project** (e.g., "My Awesome App")
3. **Add environment files** (paste your `.env` content)
4. **Set up your passphrase** (first time only)
5. **Unlock when needed** - Your secrets decrypt in the browser
6. **Copy or download** - Get your env vars back instantly
7. **View history** - See all changes with version control and diffs
8. **Lock when done** - Encryption key is cleared from memory

## Security Details

- **Encryption**: AES-GCM-256 (industry standard)
- **Key Derivation**: PBKDF2-SHA256 with 350,000 iterations
- **Salt**: 16 random bytes per user (stored in database)
- **IV**: 12 random bytes per encryption (never reused)
- **Key Storage**: In-memory only (React Context)
- **Passphrase Verification**: Test ciphertext ("UNLOCK_OK") stored in database
- **Auto-lock**: 30 minutes of inactivity or tab visibility change
- **RLS Policies**: Row-level security ensures you only see your own data

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account (free tier works great)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/calyx.git
cd calyx
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables:

```bash
cp .env.example .env
```

4. Add your Supabase credentials to `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Set up the database schema (see `docs/` for SQL scripts)

6. Run the development server:

```bash
npm run dev
```

7. Open [http://localhost:4321](http://localhost:4321)

## Database Schema

The app uses four main tables:

- **profiles** - User encryption salts and test ciphertext
- **projects** - Your project containers
- **env_vars** - Encrypted environment files
- **env_var_versions** - Version history for all changes (automatic tracking)

All tables use Row Level Security (RLS) to ensure data isolation.

Database triggers automatically create version snapshots whenever you update an env file, giving you a complete audit trail without any extra work.

See `.kiro/steering/supabase-schema.md` for the complete schema.

## Project Structure

```
calyx/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Protected routes (dashboard, projects)
│   └── (auth)/            # Public routes (login)
├── components/            # React components
│   ├── env-variables/    # Env file management components
│   ├── projects/         # Project management components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and helpers
│   ├── contexts/         # React Context (SecretContext)
│   ├── crypto.ts         # Encryption/decryption functions
│   ├── supabase/         # Supabase client setup
│   └── validations/      # Zod schemas
└── docs/                  # Documentation
```

## Why "Calyx"?

A calyx is the protective outer layer of a flower bud - it shields what's inside until it's ready to bloom. Seemed fitting for a secrets manager. 🌸

## Contributing

This is a personal project, but if you find bugs or have suggestions, feel free to open an issue!

## License

MIT License - feel free to use this for your own projects.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Authentication and database by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)

---

Made with ☕ by [Ashwin](https://github.com/yourusername) because I was tired of losing my `.env` files.
