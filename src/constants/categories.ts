import { Category } from '../types';

export const CATEGORY_ICONS: { [key: string]: string } = {
  Gold: '💍',
  Stock: '📈',
  SIP: '💰',
  Petrol: '⛽',
  'Room Rent': '🏠',
  Groceries: '🛒',
  Food: '🍔',
  Shopping: '🛍️',
  'Skin Care': '🧴',
  Trip: '✈️',
  Movie: '🎬',
  'Unknown Expenses': '❓',
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'gold',
    name: 'Gold',
    icon: CATEGORY_ICONS.Gold,
    budget: 0,
    spent: 0,
    transactions: [],
  },
  {
    id: 'stock',
    name: 'Stock',
    icon: CATEGORY_ICONS.Stock,
    budget: 0,
    spent: 0,
    transactions: [],
  },
  {
    id: 'sip',
    name: 'SIP',
    icon: CATEGORY_ICONS.SIP,
    budget: 0,
    spent: 0,
    transactions: [],
  },
  {
    id: 'petrol',
    name: 'Petrol',
    icon: CATEGORY_ICONS.Petrol,
    budget: 0,
    spent: 0,
    transactions: [],
  },
  {
    id: 'room-rent',
    name: 'Room Rent',
    icon: CATEGORY_ICONS['Room Rent'],
    budget: 0,
    spent: 0,
    transactions: [],
  },
  {
    id: 'groceries',
    name: 'Groceries',
    icon: CATEGORY_ICONS.Groceries,
    budget: 0,
    spent: 0,
    transactions: [],
  },
  {
    id: 'food',
    name: 'Food',
    icon: CATEGORY_ICONS.Food,
    budget: 0,
    spent: 0,
    transactions: [],
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: CATEGORY_ICONS.Shopping,
    budget: 0,
    spent: 0,
    transactions: [],
  },
  {
    id: 'skin-care',
    name: 'Skin Care',
    icon: CATEGORY_ICONS['Skin Care'],
    budget: 0,
    spent: 0,
    transactions: [],
  },
  {
    id: 'trip',
    name: 'Trip',
    icon: CATEGORY_ICONS.Trip,
    budget: 0,
    spent: 0,
    transactions: [],
  },
  {
    id: 'movie',
    name: 'Movie',
    icon: CATEGORY_ICONS.Movie,
    budget: 0,
    spent: 0,
    transactions: [],
  },
  {
    id: 'unknown-expenses',
    name: 'Unknown Expenses',
    icon: CATEGORY_ICONS['Unknown Expenses'],
    budget: 0,
    spent: 0,
    transactions: [],
  },
];

export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

