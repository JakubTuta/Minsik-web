/**
 * Converts text to title case (first letter of each word uppercase, rest lowercase)
 * @param text - The text to convert
 * @returns The text in title case
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
