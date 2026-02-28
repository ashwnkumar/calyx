import type { Metadata } from "next";
import { Geist, Public_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Calyx - Zero-Knowledge Secrets Manager",
    template: "%s | Calyx",
  },
  description:
    "Personal, zero-knowledge secrets manager for environment variables. Client-side encryption ensures your secrets never reach the server in plaintext.",
  keywords: [
    "secrets manager",
    "environment variables",
    "zero-knowledge",
    "encryption",
    "AES-GCM",
    "password manager",
    "env files",
  ],
  authors: [{ name: "Ashwin" }],
  creator: "Ashwin",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: defaultUrl,
    title: "Calyx - Zero-Knowledge Secrets Manager",
    description:
      "Personal, zero-knowledge secrets manager for environment variables. Client-side encryption ensures your secrets never reach the server in plaintext.",
    siteName: "Calyx",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calyx - Zero-Knowledge Secrets Manager",
    description:
      "Personal, zero-knowledge secrets manager for environment variables.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const fontSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} ${fontSans.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
