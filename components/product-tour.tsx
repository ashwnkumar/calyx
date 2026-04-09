"use client";

import { useEffect, useState, useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useSecrets } from "@/lib/contexts/SecretContext";
import type { ApiResponse } from "@/lib/types/api";

type ProfileData = {
  encryption_salt: string;
  test_iv: string | null;
  test_ciphertext: string | null;
  has_passphrase: boolean;
  settings: Record<string, unknown>;
};

export function ProductTour() {
  const { isPassphraseSetup, isLoading } = useSecrets();
  const [shouldRun, setShouldRun] = useState(false);

  const markTourComplete = useCallback(async () => {
    try {
      await fetch("/api/v1/profile/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ has_seen_tour: true }),
      });
    } catch {
      // Non-critical — don't block the user if this fails
    }
  }, []);

  // Check if tour should run after context finishes loading
  useEffect(() => {
    if (isLoading) return;

    let cancelled = false;

    async function checkTourStatus() {
      try {
        const res = await fetch("/api/v1/profile");
        const json: ApiResponse<ProfileData> = await res.json();

        if (!json.success || cancelled) return;

        if (!json.data.settings?.has_seen_tour) {
          // Small delay to let the dashboard render fully
          setTimeout(() => {
            if (!cancelled) setShouldRun(true);
          }, 500);
        }
      } catch {
        // If we can't check, don't show the tour
      }
    }

    checkTourStatus();
    return () => {
      cancelled = true;
    };
  }, [isLoading]);

  useEffect(() => {
    if (!shouldRun) return;

    const steps = [
      {
        popover: {
          title: "Welcome to Calyx 👋",
          description:
            "Calyx keeps your .env files encrypted and accessible across devices. Let me show you around — it only takes a moment.",
        },
      },
      {
        element: "#add-project-btn",
        popover: {
          title: "Create a Project",
          description:
            "Start by creating a project for each app or service. This is where your environment variables will live.",
        },
      },
      {
        element: "#lock-toggle-btn",
        popover: {
          title: "Lock & Unlock",
          description:
            "This controls access to your secrets. You'll set up a master passphrase (separate from your login password) that encrypts everything client-side.",
        },
      },
    ];

    // Add passphrase banner step only if passphrase isn't set up yet
    if (!isPassphraseSetup) {
      steps.push({
        element: "#passphrase-banner",
        popover: {
          title: "Set Up Your Passphrase",
          description:
            "This is your encryption key — it never leaves your browser and isn't stored anywhere. If you lose it, your data can't be recovered. Pick something strong and memorable.",
        },
      });
    }

    steps.push(
      {
        element: "#main-nav",
        popover: {
          title: "Navigation",
          description:
            "Use the dashboard to manage projects and settings to update your account preferences.",
        },
      },
      {
        popover: {
          title: "You're all set!",
          description:
            "Create your first project, set up your passphrase, and start adding environment variables. Your secrets are always encrypted end-to-end.",
        },
      },
    );

    const tourDriver = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: "black",
      overlayOpacity: 0.4,
      stagePadding: 10,
      stageRadius: 8,
      popoverClass: "calyx-tour-popover",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Get Started",
      onDestroyed: () => {
        markTourComplete();
        setShouldRun(false);
      },
      steps,
    });

    tourDriver.drive();

    return () => {
      tourDriver.destroy();
    };
  }, [shouldRun, isPassphraseSetup, markTourComplete]);

  return null;
}
