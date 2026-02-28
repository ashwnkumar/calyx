export type ParsedEnvVar = {
  key: string;
  value: string;
};

/**
 * Parses .env formatted content into key-value pairs.
 *
 * Handles:
 * - KEY=value format
 * - Quoted values (single and double quotes)
 * - Comments (lines starting with #)
 * - Empty lines
 * - Whitespace trimming
 *
 * @param content - The .env file content as a string
 * @returns Array of parsed key-value pairs
 */
export function parseEnvContent(content: string): ParsedEnvVar[] {
  const lines = content.split("\n");
  const result: ParsedEnvVar[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    // Find first equals sign
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      continue; // Skip lines without =
    }

    const key = trimmed.substring(0, equalsIndex).trim();
    let value = trimmed.substring(equalsIndex + 1).trim();

    // Remove surrounding quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.substring(1, value.length - 1);
    }

    if (key) {
      result.push({ key, value });
    }
  }

  return result;
}
