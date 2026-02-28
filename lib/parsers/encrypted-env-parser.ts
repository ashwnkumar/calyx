/**
 * Parser for Encrypted .env Files
 *
 * Handles the special format: KEY=iv:ciphertext
 *
 * CRITICAL: Base64 strings can contain '=' padding characters.
 * We must split only on the FIRST '=' to separate key from value.
 *
 * Example line: DATABASE_URL=dGVzdGl2MTI==:Y2lwaGVydGV4dDEyMw==
 *   - Key: DATABASE_URL
 *   - IV: dGVzdGl2MTI==
 *   - Ciphertext: Y2lwaGVydGV4dDEyMw==
 */

export type EncryptedEnvEntry = {
  key: string;
  iv: string;
  ciphertext: string;
};

/**
 * Parse encrypted .env file content
 * Format: KEY=iv:ciphertext (one line per variable)
 *
 * @param content - The raw .env file content
 * @returns Array of parsed encrypted entries
 */
export function parseEncryptedEnvContent(content: string): EncryptedEnvEntry[] {
  const lines = content.split("\n");
  const entries: EncryptedEnvEntry[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    // Find the first '=' to split key from value
    // This is critical because base64 strings can contain '=' padding
    const firstEqualIndex = trimmed.indexOf("=");

    if (firstEqualIndex === -1) {
      // Skip lines without '='
      continue;
    }

    const key = trimmed.substring(0, firstEqualIndex).trim();
    const value = trimmed.substring(firstEqualIndex + 1).trim();

    // Split value on ':' to get iv and ciphertext
    const colonIndex = value.indexOf(":");

    if (colonIndex === -1) {
      // Skip lines without ':' separator
      continue;
    }

    const iv = value.substring(0, colonIndex);
    const ciphertext = value.substring(colonIndex + 1);

    entries.push({ key, iv, ciphertext });
  }

  return entries;
}

/**
 * Validate that an encrypted env entry has valid base64 encoding
 *
 * @param entry - The encrypted entry to validate
 * @returns true if both iv and ciphertext are valid base64
 */
export function isValidEncryptedEntry(entry: EncryptedEnvEntry): boolean {
  try {
    // Attempt to decode both iv and ciphertext
    atob(entry.iv);
    atob(entry.ciphertext);
    return true;
  } catch {
    return false;
  }
}
