/**
 * Pretext utility library for cleaning MD files and optimizing prompts.
 */

export const Pretext = {
  /**
   * Cleans Markdown files by removing extra whitespace, comments, and other non-essential tokens.
   */
  cleanMarkdown: (text) => {
    if (!text) return "";
    return text
      .replace(/<!--[\s\S]*?-->/g, "") // Remove HTML comments
      .replace(/\r\n/g, "\n")          // Normalize line endings
      .replace(/[ \t]+/g, " ")         // Replace multiple spaces/tabs with single space
      .replace(/\n\s*\n/g, "\n\n")     // Replace multiple newlines with double newlines
      .trim();
  },

  /**
   * Normalizes prompts to ensure consistent results and token savings.
   */
  normalizePrompt: (prompt) => {
    if (!prompt) return "";
    return prompt.trim().replace(/\s+/g, " ");
  },

  /**
   * Simple token estimation (approx 4 chars per token).
   */
  estimateTokens: (text) => {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }
};
