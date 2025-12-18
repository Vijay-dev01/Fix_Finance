import { TransactionType } from '../types';
import { INITIAL_CATEGORIES } from '../constants/categories';

export interface ParsedSMS {
  amount: number;
  type: TransactionType;
  description: string;
  category?: string;
  merchant?: string;
  date?: Date;
}

// Common bank SMS patterns
const BANK_PATTERNS = [
  // Debit patterns
  /debited|debit|spent|paid|purchase|withdrawn/i,
  // Credit patterns
  /credited|credit|received|deposit|salary|income|refund/i,
];

// Category keywords mapping
const CATEGORY_KEYWORDS: { [key: string]: string[] } = {
  'petrol': ['petrol', 'fuel', 'gas', 'gasoline', 'bpcl', 'hp', 'indian oil'],
  'food': ['restaurant', 'food', 'zomato', 'swiggy', 'uber eats', 'mcdonald', 'kfc', 'pizza'],
  'groceries': ['grocery', 'supermarket', 'bigbasket', 'grofers', 'dmart', 'reliance fresh'],
  'shopping': ['amazon', 'flipkart', 'myntra', 'shopping', 'purchase', 'order'],
  'room-rent': ['rent', 'room rent', 'house rent', 'accommodation'],
  'trip': ['flight', 'hotel', 'travel', 'trip', 'booking', 'makemytrip', 'goibibo'],
  'movie': ['movie', 'cinema', 'bookmyshow', 'ticket'],
  'skin-care': ['pharmacy', 'medicine', 'apollo', 'wellness', 'health'],
  'gold': ['gold', 'jewellery', 'jewelry'],
  'stock': ['stock', 'share', 'nse', 'bse', 'investment'],
  'sip': ['sip', 'mutual fund', 'mf', 'investment'],
};

// Amount extraction patterns
const AMOUNT_PATTERNS = [
  /(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
  /(\d+(?:,\d+)*(?:\.\d{2})?)\s*(?:rs\.?|inr|₹)/i,
  /amount[:\s]+(?:rs\.?|inr|₹)?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
  /(\d+(?:,\d+)*(?:\.\d{2})?)\s*(?:debited|credited|spent|paid|received)/i,
];

export class SMSParser {
  /**
   * Parse SMS message to extract transaction details
   */
  static parseSMS(smsBody: string, sender?: string): ParsedSMS | null {
    const normalizedBody = smsBody.toLowerCase().trim();
    
    // Extract amount
    const amount = this.extractAmount(normalizedBody);
    if (!amount || amount <= 0) {
      return null; // No valid amount found
    }

    // Determine transaction type
    const type = this.determineType(normalizedBody);

    // Extract description
    const description = this.extractDescription(smsBody, sender);

    // Determine category
    const category = this.determineCategory(normalizedBody, description);

    return {
      amount,
      type,
      description,
      category,
      merchant: this.extractMerchant(normalizedBody, sender),
      date: new Date(),
    };
  }

  /**
   * Extract amount from SMS
   */
  private static extractAmount(text: string): number | null {
    for (const pattern of AMOUNT_PATTERNS) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const amountStr = match[1].replace(/,/g, '');
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }
    return null;
  }

  /**
   * Determine if transaction is income or expense
   */
  private static determineType(text: string): TransactionType {
    const creditKeywords = ['credited', 'credit', 'received', 'deposit', 'salary', 'income', 'refund'];
    const debitKeywords = ['debited', 'debit', 'spent', 'paid', 'purchase', 'withdrawn'];

    const hasCredit = creditKeywords.some(keyword => text.includes(keyword));
    const hasDebit = debitKeywords.some(keyword => text.includes(keyword));

    if (hasCredit && !hasDebit) {
      return 'income';
    }
    return 'expense';
  }

  /**
   * Extract description from SMS
   */
  private static extractDescription(smsBody: string, sender?: string): string {
    // Try to extract merchant/description
    let description = smsBody.trim();
    
    // Remove common prefixes
    description = description.replace(/^(?:upi|imps|neft|rtgs|upi payment)/i, '').trim();
    
    // Extract merchant name if present
    const merchantMatch = description.match(/(?:to|at|from)\s+([A-Z][A-Z0-9\s]+?)(?:\s+(?:rs|inr|₹|\d))/i);
    if (merchantMatch && merchantMatch[1]) {
      return merchantMatch[1].trim();
    }

    // Use sender as fallback
    if (sender && !description.includes(sender)) {
      return `${description.substring(0, 50)} - ${sender}`;
    }

    // Limit description length
    return description.substring(0, 100);
  }

  /**
   * Determine category based on keywords
   */
  private static determineCategory(text: string, description: string): string | undefined {
    const searchText = `${text} ${description}`.toLowerCase();

    for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(keyword => searchText.includes(keyword))) {
        return categoryId;
      }
    }

    // Default category for expenses
    return 'unknown-expenses';
  }

  /**
   * Extract merchant name
   */
  private static extractMerchant(text: string, sender?: string): string | undefined {
    // Common merchant patterns
    const merchantPatterns = [
      /(?:to|at|from)\s+([A-Z][A-Z0-9\s]+?)(?:\s+(?:rs|inr|₹|\d))/i,
      /merchant[:\s]+([A-Z][A-Z0-9\s]+)/i,
    ];

    for (const pattern of merchantPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return sender;
  }

  /**
   * Check if SMS is a transaction SMS
   */
  static isTransactionSMS(smsBody: string, sender?: string): boolean {
    const text = smsBody.toLowerCase();
    
    // Check for amount indicators
    const hasAmount = AMOUNT_PATTERNS.some(pattern => pattern.test(text));
    
    // Check for transaction keywords
    const hasTransactionKeywords = BANK_PATTERNS.some(pattern => pattern.test(text));
    
    // Check for common bank senders
    const isBankSender = sender ? this.isBankSender(sender) : false;
    
    return hasAmount && (hasTransactionKeywords || isBankSender);
  }

  /**
   * Check if sender is a known bank
   */
  private static isBankSender(sender: string): boolean {
    const bankKeywords = [
      'bank', 'sbi', 'hdfc', 'icici', 'axis', 'kotak', 'pnb', 'bob', 
      'upi', 'paytm', 'phonepe', 'gpay', 'razorpay'
    ];
    
    const normalizedSender = sender.toLowerCase();
    return bankKeywords.some(keyword => normalizedSender.includes(keyword));
  }
}

