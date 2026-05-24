/**
 * Converts any string into a URL-safe slug.
 *
 * Rules:
 *   - Lowercase
 *   - Accented / special characters → ASCII equivalent
 *   - Anything not [a-z0-9] → hyphen
 *   - Multiple consecutive hyphens collapsed into one
 *   - Leading / trailing hyphens stripped
 *
 * Examples:
 *   "Rock Alternativo"  → "rock-alternativo"
 *   "R&B / Soul"        → "r-b-soul"
 *   "Palacio de Congresos de Granada" → "palacio-de-congresos-de-granada"
 *   "  --foo-- "        → "foo"
 */
export function generateSlug(value: string): string {
  return value
    .normalize('NFD')                      // decompose accents: á → a + ́
    .replace(/[\u0300-\u036f]/g, '')       // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')           // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, '');             // trim leading / trailing hyphens
}

/**
 * Ensures the generated slug is unique against the repository.
 * If the base slug is taken, appends -2, -3, … until a free slot is found.
 *
 * @param base       Raw slug generated from the name
 * @param exists     Async predicate: returns true when the slug is already in use
 * @param excludeId  Optional — ignore this record's own slug (useful on update)
 */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
  excludeId?: string,
): Promise<string> {
  // excludeId is handled by the caller passing a correctly scoped `exists` fn.
  // This overload is kept for API symmetry.
  void excludeId;

  let candidate = base;
  let counter = 2;

  while (await exists(candidate)) {
    candidate = `${base}-${counter}`;
    counter++;
  }

  return candidate;
}
