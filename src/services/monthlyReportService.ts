import { BudgetState, Transaction } from '../types';
import { formatCurrency } from '../constants/categories';

export interface MonthlyReport {
  month: string;
  totalIncome: number;
  totalBudget: number;
  totalSpent: number;
  remainingBalance: number;
  categories: Array<{
    name: string;
    icon: string;
    budget: number;
    spent: number;
    transactions: Transaction[];
  }>;
  incomeTransactions: Transaction[];
}

/**
 * Generate a monthly report from budget state
 */
export const generateMonthlyReport = (state: BudgetState): MonthlyReport => {
  return {
    month: state.currentMonth,
    totalIncome: state.totalIncome,
    totalBudget: state.totalBudget,
    totalSpent: state.totalSpent,
    remainingBalance: state.remainingBalance,
    categories: state.categories.map(cat => ({
      name: cat.name,
      icon: cat.icon,
      budget: cat.budget,
      spent: cat.spent,
      transactions: cat.transactions,
    })),
    incomeTransactions: state.incomeTransactions,
  };
};

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Format month name for display
 */
const formatMonthName = (monthString: string): string => {
  try {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
  } catch {
    return monthString;
  }
};

/**
 * Generate HTML email body from report with inline styles for email client compatibility
 */
export const generateEmailBody = (report: MonthlyReport): string => {
  const monthName = formatMonthName(report.month);
  const spentPercentage = report.totalBudget > 0 ? (report.totalSpent / report.totalBudget) * 100 : 0;
  const progressWidth = Math.min(spentPercentage, 100);
  const progressColor = spentPercentage > 100 ? '#ef4444' : '#10b981';
  
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; margin-bottom: 8px;">📊 Monthly Budget Report</h1>
              <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: normal; opacity: 0.95;">${monthName}</h2>
            </td>
          </tr>
          
          <!-- Summary Section -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: bold; color: #2c3e50; text-align: center;">Financial Summary</h2>
              
              <!-- Summary Cards Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="50%" style="padding: 8px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); border-radius: 12px; padding: 20px; text-align: center;">
                      <tr>
                        <td>
                          <div style="font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Total Income</div>
                          <div style="font-size: 24px; font-weight: bold; color: #1e293b;">${formatCurrency(report.totalIncome)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="50%" style="padding: 8px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); border-radius: 12px; padding: 20px; text-align: center;">
                      <tr>
                        <td>
                          <div style="font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Total Budget</div>
                          <div style="font-size: 24px; font-weight: bold; color: #1e293b;">${formatCurrency(report.totalBudget)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding: 8px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 12px; padding: 20px; text-align: center;">
                      <tr>
                        <td>
                          <div style="font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Total Spent</div>
                          <div style="font-size: 24px; font-weight: bold; color: #1e293b;">${formatCurrency(report.totalSpent)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="50%" style="padding: 8px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, ${report.remainingBalance >= 0 ? '#a8e6cf 0%, #dcedc1 100%' : '#ff9a9e 0%, #fecfef 100%'}); border-radius: 12px; padding: 20px; text-align: center;">
                      <tr>
                        <td>
                          <div style="font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Remaining</div>
                          <div style="font-size: 24px; font-weight: bold; color: #1e293b;">${formatCurrency(report.remainingBalance)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              ${report.totalBudget > 0 ? `
              <!-- Progress Bar -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-top: 20px;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                      <tr>
                        <td style="font-size: 14px; font-weight: 600; color: #475569;">Budget Utilization</td>
                        <td align="right" style="font-size: 14px; font-weight: 600; color: #475569;">${spentPercentage.toFixed(1)}%</td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e2e8f0; border-radius: 10px; height: 24px;">
                      <tr>
                        <td width="${progressWidth}%" style="background-color: ${progressColor}; border-radius: 10px; height: 24px; text-align: center; color: #ffffff; font-size: 12px; font-weight: 600; vertical-align: middle;">
                          ${progressWidth > 5 ? spentPercentage.toFixed(0) + '%' : ''}
                        </td>
                        <td width="${100 - progressWidth}%"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
`;

  // Income Transactions
  if (report.incomeTransactions.length > 0) {
    html += `
          <!-- Income Section -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 20px;">
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #f1f5f9;">
                      <tr>
                        <td style="font-size: 32px; padding-right: 12px;">💰</td>
                        <td style="font-size: 20px; font-weight: bold; color: #1e293b;">Income Transactions</td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                      <thead>
                        <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                          <th style="padding: 14px 16px; text-align: left; font-weight: 600; font-size: 13px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">Date</th>
                          <th style="padding: 14px 16px; text-align: left; font-weight: 600; font-size: 13px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">Description</th>
                          <th style="padding: 14px 16px; text-align: right; font-weight: 600; font-size: 13px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
`;
    report.incomeTransactions.forEach(transaction => {
      html += `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                          <td style="padding: 14px 16px; font-size: 14px; color: #475569;">${formatDate(transaction.date)}</td>
                          <td style="padding: 14px 16px; font-size: 14px; color: #475569;">${(transaction.description || 'N/A').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                          <td style="padding: 14px 16px; font-size: 15px; font-weight: bold; color: #10b981; text-align: right;">${formatCurrency(transaction.amount)}</td>
                        </tr>
`;
    });
    html += `
                      </tbody>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
`;
  }

  // Expense Categories
  report.categories.forEach(category => {
    if (category.transactions.length > 0 || category.budget > 0) {
      const categoryRemaining = category.budget - category.spent;
      const categoryPercentage = category.budget > 0 ? (category.spent / category.budget) * 100 : 0;
      const categoryProgressWidth = Math.min(categoryPercentage, 100);
      const categoryProgressColor = categoryPercentage > 100 ? '#ef4444' : '#10b981';
      
      html += `
          <!-- Category: ${category.name} -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 20px;">
                <tr>
                  <td>
                    <!-- Category Header -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #f1f5f9;">
                      <tr>
                        <td style="font-size: 32px; padding-right: 12px;">${category.icon}</td>
                        <td style="font-size: 20px; font-weight: bold; color: #1e293b;">${category.name}</td>
                      </tr>
                    </table>
                    
                    <!-- Category Stats -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                      <tr>
                        <td width="33%" style="padding: 12px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
                          <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Budget</div>
                          <div style="font-size: 16px; font-weight: bold; color: #1e293b;">${formatCurrency(category.budget)}</div>
                        </td>
                        <td width="33%" style="padding: 12px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
                          <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Spent</div>
                          <div style="font-size: 16px; font-weight: bold; color: ${category.spent > category.budget ? '#ef4444' : '#475569'};">${formatCurrency(category.spent)}</div>
                        </td>
                        <td width="33%" style="padding: 12px; background-color: #f8fafc; border-radius: 8px; text-align: center;">
                          <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Remaining</div>
                          <div style="font-size: 16px; font-weight: bold; color: ${categoryRemaining >= 0 ? '#10b981' : '#ef4444'};">${formatCurrency(categoryRemaining)}</div>
                        </td>
                      </tr>
                    </table>
`;
      
      if (category.budget > 0) {
        html += `
                    <!-- Category Progress -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                      <tr>
                        <td>
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                            <tr>
                              <td style="font-size: 14px; font-weight: 600; color: #475569;">Usage</td>
                              <td align="right" style="font-size: 14px; font-weight: 600; color: #475569;">${categoryPercentage.toFixed(1)}%</td>
                            </tr>
                          </table>
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e2e8f0; border-radius: 10px; height: 24px;">
                            <tr>
                              <td width="${categoryProgressWidth}%" style="background-color: ${categoryProgressColor}; border-radius: 10px; height: 24px; text-align: center; color: #ffffff; font-size: 12px; font-weight: 600; vertical-align: middle;">
                                ${categoryProgressWidth > 5 ? categoryPercentage.toFixed(0) + '%' : ''}
                              </td>
                              <td width="${100 - categoryProgressWidth}%"></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
`;
      }
      
      if (category.transactions.length > 0) {
        html += `
                    <!-- Transactions Table -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                      <thead>
                        <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                          <th style="padding: 14px 16px; text-align: left; font-weight: 600; font-size: 13px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">Date</th>
                          <th style="padding: 14px 16px; text-align: left; font-weight: 600; font-size: 13px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">Description</th>
                          <th style="padding: 14px 16px; text-align: right; font-weight: 600; font-size: 13px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
`;
        category.transactions.forEach(transaction => {
          html += `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                          <td style="padding: 14px 16px; font-size: 14px; color: #475569;">${formatDate(transaction.date)}</td>
                          <td style="padding: 14px 16px; font-size: 14px; color: #475569;">${(transaction.description || 'N/A').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                          <td style="padding: 14px 16px; font-size: 15px; font-weight: bold; color: #ef4444; text-align: right;">${formatCurrency(transaction.amount)}</td>
                        </tr>
`;
        });
        html += `
                      </tbody>
                    </table>
`;
      } else {
        html += `
                    <div style="text-align: center; padding: 30px; color: #94a3b8; font-style: italic; background-color: #f8fafc; border-radius: 8px;">
                      No transactions recorded this month
                    </div>
`;
      }
      
      html += `
                  </td>
                </tr>
              </table>
            </td>
          </tr>
`;
    }
  });

  html += `
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 2px solid #e2e8f0;">
              <div style="font-size: 12px; color: #94a3b8; margin: 4px 0;">Generated automatically by <strong>VStack Budget Planner</strong></div>
              <div style="font-size: 12px; color: #94a3b8; margin: 4px 0;">Report Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return html;
};

/**
 * Generate plain text email body from report
 */
export const generatePlainTextBody = (report: MonthlyReport): string => {
  const monthName = formatMonthName(report.month);
  
  let text = `
═══════════════════════════════════════════════════════════
📊 MONTHLY BUDGET REPORT - ${monthName}
═══════════════════════════════════════════════════════════

SUMMARY
─────────────────────────────────────────────────────────
Total Income:     ${formatCurrency(report.totalIncome)}
Total Budget:     ${formatCurrency(report.totalBudget)}
Total Spent:      ${formatCurrency(report.totalSpent)}
Remaining:        ${formatCurrency(report.remainingBalance)}

`;

  // Income Transactions
  if (report.incomeTransactions.length > 0) {
    text += `
💰 INCOME TRANSACTIONS
─────────────────────────────────────────────────────────
`;
    report.incomeTransactions.forEach(transaction => {
      text += `${formatDate(transaction.date)} | ${transaction.description || 'N/A'} | ${formatCurrency(transaction.amount)}\n`;
    });
    text += '\n';
  }

  // Expense Categories
  report.categories.forEach(category => {
    if (category.transactions.length > 0 || category.budget > 0) {
      text += `
${category.icon} ${category.name.toUpperCase()}
─────────────────────────────────────────────────────────
Budget: ${formatCurrency(category.budget)} | Spent: ${formatCurrency(category.spent)} | Remaining: ${formatCurrency(category.budget - category.spent)}

`;
      
      if (category.transactions.length > 0) {
        category.transactions.forEach(transaction => {
          text += `  ${formatDate(transaction.date)} | ${transaction.description || 'N/A'} | ${formatCurrency(transaction.amount)}\n`;
        });
      } else {
        text += `  No transactions this month\n`;
      }
      text += '\n';
    }
  });

  text += `
═══════════════════════════════════════════════════════════
Generated automatically by VStack Budget Planner
Report Date: ${new Date().toLocaleDateString('en-IN')}
═══════════════════════════════════════════════════════════
`;

  return text;
};
