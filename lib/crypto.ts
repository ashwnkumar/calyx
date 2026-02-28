/**
 * Client-side cryptography utilities for Calyx
 * AES-GCM-256 + PBKDF2-SHA256
 */

const PBKDF2_ITERATIONS = 350_000;
const SALT_LENGTH = 16; // bytes
const IV_LENGTH = 12; // bytes for GCM

/**
 * Generate a random base64-encoded salt
 */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return btoa(String.fromCharCode(...salt));
}

/**
 * Generate a random base64-encoded IV
 */
export function generateIV(): string {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  return btoa(String.fromCharCode(...iv));
}

/**
 * Derive an AES-GCM key from passphrase + salt using PBKDF2
 */
export async function deriveKey(
  passphrase: string,
  saltBase64: string
): Promise<CryptoKey> {
  const salt = Uint8Array.from(atob(saltBase64), (c) => c.charCodeAt(0));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // non-extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext using AES-GCM
 * Returns { iv, ciphertext } both base64-encoded
 */
export async function encrypt(
  plaintext: string,
  key: CryptoKey
): Promise<{ iv: string; ciphertext: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  return {
    iv: btoa(String.fromCharCode(...iv)),
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer))),
  };
}

/**
 * Decrypt ciphertext using AES-GCM
 * Throws if decryption fails (wrong key/corrupted data)
 */
export async function decrypt(
  ivBase64: string,
  ciphertextBase64: string,
  key: CryptoKey
): Promise<string> {
  const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(ciphertextBase64), (c) =>
    c.charCodeAt(0)
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decryptedBuffer);
}
