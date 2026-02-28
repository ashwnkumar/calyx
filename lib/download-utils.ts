/**
 * Download Utilities for Encrypted Environment Variables
 *
 * Provides functions for generating and downloading encrypted env var files
 * in various formats (JSON, .env) while maintaining zero-knowledge security.
 */

/**
 * Validate if a string is valid base64 encoding
 * Returns true if the string can be decoded and re-encoded to match original
 */
export function isValidBase64(str: string): boolean {
  if (!str || typeof str !== "string") {
    return false;
  }

  try {
    // Attempt to decode and re-encode
    // If it matches the original, it's valid base64
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
}

/**
 * Sanitize a string to produce a safe filename
 * Replaces spaces with underscores, removes special characters,
 * collapses multiple underscores, and converts to lowercase
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_-]/g, "_") // Replace special chars with underscore
    .replace(/_{2,}/g, "_") // Collapse multiple underscores
    .replace(/^_|_$/g, "") // Trim leading/trailing underscores
    .toLowerCase();
}

/**
 * Trigger browser download of a file
 * Uses Blob API and URL.createObjectURL
 * Cleans up object URL after download
 */
function downloadFile(
  filename: string,
  content: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Clean up object URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Download a single encrypted environment variable as JSON
 * Format: {key: string, iv: string, ciphertext: string}
 * Filename: {project_name}_{env_key}_encrypted.json
 */
export function downloadSingleEncrypted(
  projectName: string,
  envVar: { key: string; iv: string; ciphertext: string },
): void {
  // Validate base64 format before download
  if (!isValidBase64(envVar.iv) || !isValidBase64(envVar.ciphertext)) {
    throw new Error("Invalid encrypted data format");
  }

  const sanitizedProject = sanitizeFilename(projectName);
  const sanitizedKey = sanitizeFilename(envVar.key);
  const filename = `${sanitizedProject}_${sanitizedKey}_encrypted.json`;

  const content = JSON.stringify(
    {
      key: envVar.key,
      iv: envVar.iv,
      ciphertext: envVar.ciphertext,
    },
    null,
    2,
  );

  downloadFile(filename, content, "application/json");
}

/**
 * Download all encrypted environment variables as JSON array
 * Format: [{key, iv, ciphertext}, ...]
 * Filename: {project_name}_all_encrypted.json
 */
export function downloadAllEncryptedJson(
  projectName: string,
  envVars: Array<{ key: string; iv: string; ciphertext: string }>,
): void {
  // Validate all entries before download
  for (const envVar of envVars) {
    if (!isValidBase64(envVar.iv) || !isValidBase64(envVar.ciphertext)) {
      throw new Error(`Invalid encrypted data format for key: ${envVar.key}`);
    }
  }

  const sanitizedProject = sanitizeFilename(projectName);
  const filename = `${sanitizedProject}_all_encrypted.json`;

  const content = JSON.stringify(
    envVars.map((envVar) => ({
      key: envVar.key,
      iv: envVar.iv,
      ciphertext: envVar.ciphertext,
    })),
    null,
    2,
  );

  downloadFile(filename, content, "application/json");
}

/**
 * Download all encrypted environment variables in .env format
 * Format: KEY=iv:ciphertext (one line per variable)
 * Uses Unix line endings (\n)
 * Filename: {project_name}_encrypted.env
 */
export function downloadAllEncryptedEnv(
  projectName: string,
  envVars: Array<{ key: string; iv: string; ciphertext: string }>,
): void {
  // Validate all entries before download
  for (const envVar of envVars) {
    if (!isValidBase64(envVar.iv) || !isValidBase64(envVar.ciphertext)) {
      throw new Error(`Invalid encrypted data format for key: ${envVar.key}`);
    }
  }

  const sanitizedProject = sanitizeFilename(projectName);
  const filename = `${sanitizedProject}_encrypted.env`;

  const content = envVars
    .map((envVar) => `${envVar.key}=${envVar.iv}:${envVar.ciphertext}`)
    .join("\n");

  downloadFile(filename, content, "text/plain");
}
