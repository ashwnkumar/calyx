/**
 * Passphrase validation utilities for Calyx
 * Shared validation logic for SetupDialog and UnlockDialog components
 */

/**
 * Validates passphrase meets minimum length requirement
 * @param passphrase - The passphrase to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePassphrase(passphrase: string): string | null {
  if (passphrase.length < 12) {
    return "Passphrase must be at least 12 characters";
  }
  return null;
}

/**
 * Validates that passphrase and confirmation match
 * @param passphrase - The original passphrase
 * @param confirmPassphrase - The confirmation passphrase
 * @returns Error message if mismatch, null if valid
 */
export function validateConfirmPassphrase(
  passphrase: string,
  confirmPassphrase: string,
): string | null {
  if (passphrase !== confirmPassphrase) {
    return "Passphrases do not match";
  }
  return null;
}

/**
 * Handles unlock errors and returns user-friendly error messages
 * @param error - The error thrown during unlock
 * @returns User-friendly error message
 */
export function handleUnlockError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === "Incorrect passphrase") {
      return "Incorrect passphrase. Please try again.";
    }
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}
