"use client";
import { ThemeProvider } from "next-themes";
import React from "react";
import { Toaster } from "./ui/sonner";

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default LayoutWrapper;
