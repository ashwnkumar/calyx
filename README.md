# Calyx

A personal, zero-knowledge secrets manager for environment variables.

## Overview

Calyx securely stores project .env files with client-side encryption, ensuring plaintext never reaches the server. Built for single-user use with cross-device access.

## Features

- Zero-knowledge architecture: only encrypted values stored on server
- Client-side AES-GCM-256 encryption via Web Crypto API
- Passphrase-derived keys (PBKDF2) held in-memory only
- Supabase authentication and storage with RLS
- Next.js 15 App Router with TypeScript
- Tailwind CSS + shadcn/ui components

## Setup

1. Create a Supabase project at [database.new](https://database.new)

2. Copy `.env.example` to `.env.local` and add your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

   The app will be available at [localhost:4321](http://localhost:4321)

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Supabase (Auth + Database)
- Tailwind CSS
- shadcn/ui
- Web Crypto API
