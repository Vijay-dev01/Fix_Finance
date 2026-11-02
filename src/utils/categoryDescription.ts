/** Split stored description into display lines (supports * - • prefixes). */
export const parseCategoryDescriptionLines = (description: string): string[] => {
  return description
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.replace(/^[*\-•]\s*/, '').trim())
    .filter(Boolean);
};

export const hasCategoryDescription = (description?: string): boolean =>
  Boolean(description?.trim());
