/**
 * Simple line-by-line diff utility
 * Compares two text strings and returns added, removed, and unchanged lines
 */

export type DiffLine = {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNumber?: number;
};

/**
 * Generate a line-by-line diff between two strings
 * Uses a simple LCS (Longest Common Subsequence) approach
 */
export function generateDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");

  const diff: DiffLine[] = [];
  let oldIndex = 0;
  let newIndex = 0;

  // Simple diff algorithm - can be enhanced with proper LCS if needed
  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldLines[oldIndex];
    const newLine = newLines[newIndex];

    if (oldIndex >= oldLines.length) {
      // Only new lines remaining
      diff.push({
        type: "added",
        content: newLine,
        lineNumber: newIndex + 1,
      });
      newIndex++;
    } else if (newIndex >= newLines.length) {
      // Only old lines remaining
      diff.push({
        type: "removed",
        content: oldLine,
        lineNumber: oldIndex + 1,
      });
      oldIndex++;
    } else if (oldLine === newLine) {
      // Lines match
      diff.push({
        type: "unchanged",
        content: oldLine,
        lineNumber: newIndex + 1,
      });
      oldIndex++;
      newIndex++;
    } else {
      // Lines differ - check if next lines match to determine if it's a change or addition/removal
      const oldNextMatch = newLines.indexOf(oldLine, newIndex);
      const newNextMatch = oldLines.indexOf(newLine, oldIndex);

      if (
        oldNextMatch !== -1 &&
        (newNextMatch === -1 || oldNextMatch < newNextMatch)
      ) {
        // Old line appears later in new text - this is an addition
        diff.push({
          type: "added",
          content: newLine,
          lineNumber: newIndex + 1,
        });
        newIndex++;
      } else if (newNextMatch !== -1) {
        // New line appears later in old text - this is a removal
        diff.push({
          type: "removed",
          content: oldLine,
          lineNumber: oldIndex + 1,
        });
        oldIndex++;
      } else {
        // Lines are different and don't appear later - show as removed + added
        diff.push({
          type: "removed",
          content: oldLine,
          lineNumber: oldIndex + 1,
        });
        diff.push({
          type: "added",
          content: newLine,
          lineNumber: newIndex + 1,
        });
        oldIndex++;
        newIndex++;
      }
    }
  }

  return diff;
}

/**
 * Get diff statistics
 */
export function getDiffStats(diff: DiffLine[]): {
  added: number;
  removed: number;
  unchanged: number;
} {
  return diff.reduce(
    (acc, line) => {
      if (line.type === "added") acc.added++;
      else if (line.type === "removed") acc.removed++;
      else acc.unchanged++;
      return acc;
    },
    { added: 0, removed: 0, unchanged: 0 },
  );
}
