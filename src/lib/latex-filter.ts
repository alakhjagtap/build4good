/**
 * Filters out LaTeX expressions from text.
 * Removes:
 * - Inline math: $...$, \(...\)
 * - Display math: $$...$$, \[...\]
 * - LaTeX commands and environments
 */
export function filterLatex(text: string): string {
  if (!text) return text;

  let result = text;

  // Preserve text inside math delimiters but remove the delimiters
  result = result.replace(/\$\$(.*?)\$\$/g, "$1");
  result = result.replace(/\\\[(.*?)\\\]/g, "$1");
  result = result.replace(/\$(.*?)\$/g, "$1");
  result = result.replace(/\\\((.*?)\\\)/g, "$1");

  // Only remove environments that truly cannot be spoken (like \begin{figure})
  // but keep others or just remove the markup
  result = result.replace(/\\begin\{[^}]*\}|\\end\{[^}]*\}/g, " ");

  // Clean up extra whitespace
  result = result.replace(/\s+/g, " ").trim();

  return result;
}

/**
 * Filters LaTeX and returns a version safe for speech.
 * Also handles common math term replacements for natural speech.
 */
export function prepareSpeechText(text: string): string {
  let speechText = filterLatex(text);

  // Replace common math notation with spoken equivalents
  const replacements: Record<string, string | RegExp> = {
    "\\\\times": "times",
    "\\\\div": "divided by",
    "\\\\pm": "plus or minus",
    "\\\\approx": "approximately",
    "\\\\neq": "not equal to",
    "\\\\leq": "less than or equal to",
    "\\\\geq": "greater than or equal to",
    "\\\\rightarrow": "approaches",
    "→": "approaches",
    "≈": "approximately",
    "≠": "not equal to",
    "≤": "less than or equal to",
    "≥": "greater than or equal to",
    "∑": "sum",
    "∏": "product",
    "∫": "integral",
    "√": "square root of",
    "\\^": " to the power of ",
  };

  for (const [symbol, word] of Object.entries(replacements)) {
    const pattern = typeof word === "string" ? new RegExp(symbol, "g") : word;
    speechText = speechText.replace(pattern as any, ` ${word} `);
  }

  // Final cleanup of any lingering LaTeX symbols or backslashes
  speechText = speechText.replace(/\\frac\{(.*?)\}\{(.*?)\}/g, "$1 over $2");
  speechText = speechText.replace(/\\sqrt\{(.*?)\}/g, "square root of $1");
  speechText = speechText.replace(/\\/g, "");
  speechText = speechText.replace(/\{|\}/g, "");

  // Clean up extra whitespace again
  speechText = speechText.replace(/\s+/g, " ").trim();

  return speechText;
}
