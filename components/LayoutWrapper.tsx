"use client";
import React from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster, ToasterProps } from "sonner";

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
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
