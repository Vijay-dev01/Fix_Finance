/** Selectable icons for user-created categories (emoji + label for picker) */
export const CATEGORY_ICON_OPTIONS: { id: string; emoji: string; label: string }[] = [
  { id: 'stock', emoji: '📈', label: 'Stock' },
  { id: 'petrol', emoji: '⛽', label: 'Petrol' },
  { id: 'rent', emoji: '🏠', label: 'Rent' },
  { id: 'groceries', emoji: '🛒', label: 'Groceries' },
  { id: 'food', emoji: '🍔', label: 'Food' },
  { id: 'shopping', emoji: '🛍️', label: 'Shopping' },
  { id: 'health', emoji: '🧴', label: 'Health' },
  { id: 'trip', emoji: '✈️', label: 'Trip' },
  { id: 'movie', emoji: '🎬', label: 'Movie' },
  { id: 'gym', emoji: '💪', label: 'GYM' },
  { id: 'gift', emoji: '🎁', label: 'Gift' },
  { id: 'other', emoji: '❓', label: 'Other' },
  // More options
  { id: 'clothes', emoji: '👕', label: 'Clothes' },
  { id: 'kids', emoji: '👶', label: 'Kids' },
  { id: 'donation', emoji: '🤝', label: 'Donation' },
  { id: 'invest', emoji: '📊', label: 'Invest' },
  { id: 'tax', emoji: '📋', label: 'Tax' },
  { id: 'utilities', emoji: '💡', label: 'Utilities' },
  { id: 'sports', emoji: '⚽', label: 'Sports' },
];

export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/** Generate a URL-safe id from category name */
export const slugifyCategoryName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};
