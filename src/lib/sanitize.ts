const HTML_ENTITY_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

/**
 * Escape HTML special characters to prevent XSS in rendered output.
 */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => HTML_ENTITY_MAP[char] ?? char);
}

/**
 * Strip null bytes and non-printable control characters from user input.
 * Preserves newlines (\n), carriage returns (\r), and tabs (\t).
 */
export function sanitizeText(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}
