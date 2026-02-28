import { toast } from "sonner";

/**
 * Copy text to clipboard using Clipboard API with fallback to execCommand
 *
 * Attempts to use the modern Clipboard API first, falling back to the
 * deprecated execCommand method for older browsers or when permissions are denied.
 *
 * @param text - The text to copy to the clipboard
 * @throws Error if both methods fail
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    // Primary path: Modern Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
      return;
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

    if (success) {
      toast.success("Copied to clipboard");
    } else {
      throw new Error("Copy command failed");
    }
  } catch (error) {
    console.error("Copy failed:", error);
    toast.error("Failed to copy to clipboard");
    throw error;
  }
}
