/**
 * In-memory sliding-window rate limiter
 * Good enough for single-instance deployment; swap to Redis for multi-instance.
 */

type RateLimitEntry = {
  timestamps: number[];
};

type RateLimitOptions = {
  maxRequests: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetMs: number;
};

// Global store — survives across requests within the same process
const store = new Map<string, RateLimitEntry>();

// Periodic cleanup to prevent memory leaks (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup(windowMs: number) {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
      if (entry.timestamps.length === 0) store.delete(key);
    }
  }, CLEANUP_INTERVAL);
  // Don't block process exit
  if (
    cleanupTimer &&
    typeof cleanupTimer === "object" &&
    "unref" in cleanupTimer
  ) {
    cleanupTimer.unref();
  }
}

/**
 * Check rate limit for a given identifier (e.g. user ID or IP).
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions,
): RateLimitResult {
  const { maxRequests, windowMs } = options;
  const now = Date.now();

  ensureCleanup(windowMs);

  let entry = store.get(identifier);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(identifier, entry);
  }

  // Drop timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetMs: oldestInWindow + windowMs - now,
    };
  }

  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetMs: windowMs,
  };
}

// ── Preset tiers ───────────────────────────────────────────────────

export const RATE_LIMITS = {
  /** Standard read endpoints */
  read: { maxRequests: 60, windowMs: 60_000 },
  /** Standard write endpoints */
  write: { maxRequests: 30, windowMs: 60_000 },
  /** Sensitive endpoints (passphrase, profile) */
  sensitive: { maxRequests: 10, windowMs: 60_000 },
  /** Bulk operations */
  bulk: { maxRequests: 5, windowMs: 60_000 },
} as const;
