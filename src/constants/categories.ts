/** Selectable icons for user-created categories (emoji + label for picker) */
export const CATEGORY_ICON_OPTIONS: { id: string; emoji: string; label: string }[] = [
  { id: 'gold', emoji: '💍', label: 'Gold' },
  { id: 'stock', emoji: '📈', label: 'Stock' },
  { id: 'sip', emoji: '💰', label: 'Savings' },
  { id: 'petrol', emoji: '⛽', label: 'Petrol' },
  { id: 'rent', emoji: '🏠', label: 'Rent' },
  { id: 'groceries', emoji: '🛒', label: 'Groceries' },
  { id: 'food', emoji: '🍔', label: 'Food' },
  { id: 'shopping', emoji: '🛍️', label: 'Shopping' },
  { id: 'health', emoji: '🧴', label: 'Health' },
  { id: 'trip', emoji: '✈️', label: 'Trip' },
  { id: 'movie', emoji: '🎬', label: 'Movie' },
  { id: 'gym', emoji: '💪', label: 'GYM' },
  { id: 'bills', emoji: '📄', label: 'Bills' },
  { id: 'transport', emoji: '🚗', label: 'Transport' },
  { id: 'entertainment', emoji: '🎮', label: 'Entertainment' },
  { id: 'education', emoji: '📚', label: 'Education' },
  { id: 'gift', emoji: '🎁', label: 'Gift' },
  { id: 'other', emoji: '❓', label: 'Other' },
  // More options
  { id: 'coffee', emoji: '☕', label: 'Coffee' },
  { id: 'phone', emoji: '📱', label: 'Phone' },
  { id: 'wifi', emoji: '📶', label: 'Internet' },
  { id: 'subscription', emoji: '🔄', label: 'Subscription' },
  { id: 'insurance', emoji: '🛡️', label: 'Insurance' },
  { id: 'medical', emoji: '🏥', label: 'Medical' },
  { id: 'pharmacy', emoji: '💊', label: 'Pharmacy' },
  { id: 'clothes', emoji: '👕', label: 'Clothes' },
  { id: 'beauty', emoji: '💄', label: 'Beauty' },
  { id: 'pets', emoji: '🐾', label: 'Pets' },
  { id: 'kids', emoji: '👶', label: 'Kids' },
  { id: 'donation', emoji: '🤝', label: 'Donation' },
  { id: 'invest', emoji: '📊', label: 'Invest' },
  { id: 'emi', emoji: '🏦', label: 'EMI' },
  { id: 'tax', emoji: '📋', label: 'Tax' },
  { id: 'utilities', emoji: '💡', label: 'Utilities' },
  { id: 'parking', emoji: '🅿️', label: 'Parking' },
  { id: 'books', emoji: '📖', label: 'Books' },
  { id: 'music', emoji: '🎵', label: 'Music' },
  { id: 'sports', emoji: '⚽', label: 'Sports' },
  { id: 'hobby', emoji: '🎨', label: 'Hobby' },
  { id: 'travel', emoji: '🧳', label: 'Travel' },
  { id: 'hotel', emoji: '🏨', label: 'Hotel' },
  { id: 'cash', emoji: '💵', label: 'Cash' },
  { id: 'wallet', emoji: '👛', label: 'Wallet' },
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
