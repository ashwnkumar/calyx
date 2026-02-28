/**
 * Copy text to clipboard using Clipboard API with fallback to execCommand
 *
 * Attempts to use the modern Clipboard API first, falling back to the
 * deprecated execCommand method for older browsers or when permissions are denied.
 *
 * @param text - The text to copy to the clipboard
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Primary path: Modern Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback path: Deprecated execCommand (for older browsers)
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.top = "0";
    textarea.style.left = "0";

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const success = document.execCommand("copy");
    document.body.removeChild(textarea);

    return success;
  } catch (error) {
    console.error("Copy failed:", error);
    return false;
  }
}
