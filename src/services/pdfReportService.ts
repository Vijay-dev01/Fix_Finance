import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { MonthlyReport } from './monthlyReportService';
import { formatCurrency } from '../constants/categories';

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
 * Generate HTML for PDF with professional styling
 */
const generatePDFHTML = (report: MonthlyReport): string => {
  const monthName = formatMonthName(report.month);
  const spentPercentage = report.totalBudget > 0 ? (report.totalSpent / report.totalBudget) * 100 : 0;
  
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #2c3e50;
      background-color: #ffffff;
      padding: 20px;
      font-size: 12px;
      line-height: 1.6;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
      margin-bottom: 0;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .header h2 {
      font-size: 18px;
      font-weight: 400;
      opacity: 0.95;
    }
    .summary-section {
      background-color: #f8f9fa;
      padding: 25px;
      border: 1px solid #e0e0e0;
    }
    .summary-title {
      font-size: 20px;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 20px;
      text-align: center;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .summary-card {
      background: white;
      padding: 18px;
      border-radius: 8px;
      text-align: center;
      border: 2px solid #e0e0e0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-card.income {
      border-color: #84fab0;
      background: linear-gradient(135deg, #84fab015 0%, #8fd3f415 100%);
    }
    .summary-card.budget {
      border-color: #a8edea;
      background: linear-gradient(135deg, #a8edea15 0%, #fed6e315 100%);
    }
    .summary-card.spent {
      border-color: #fcb69f;
      background: linear-gradient(135deg, #ffecd215 0%, #fcb69f15 100%);
    }
    .summary-card.balance {
      border-color: ${report.remainingBalance >= 0 ? '#a8e6cf' : '#ff9a9e'};
      background: linear-gradient(135deg, ${report.remainingBalance >= 0 ? '#a8e6cf15 0%, #dcedc115 100%' : '#ff9a9e15 0%, #fecfef15 100%'});
    }
    .summary-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .summary-value {
      font-size: 22px;
      font-weight: 700;
      color: #1e293b;
    }
    .progress-container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 18px;
      border: 1px solid #e0e0e0;
    }
    .progress-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 13px;
      font-weight: 600;
      color: #475569;
    }
    .progress-bar-wrapper {
      background-color: #e2e8f0;
      border-radius: 6px;
      height: 20px;
      overflow: hidden;
      position: relative;
    }
    .progress-bar {
      height: 100%;
      background: ${spentPercentage > 100 ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(90deg, #10b981 0%, #059669 100%)'};
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 11px;
      font-weight: 600;
      min-width: ${spentPercentage > 0 ? '30px' : '0'};
    }
    .category-section {
      margin-top: 20px;
    }
    .category-card {
      background-color: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 15px;
      page-break-inside: avoid;
    }
    .category-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 12px;
      border-bottom: 2px solid #f1f5f9;
    }
    .category-icon {
      font-size: 28px;
      margin-right: 12px;
    }
    .category-name {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      flex: 1;
    }
    .category-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 15px;
    }
    .stat-item {
      text-align: center;
      padding: 12px;
      background-color: #f8fafc;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    .stat-label {
      font-size: 10px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .stat-value {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      background-color: #ffffff;
    }
    thead {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1px solid rgba(255,255,255,0.2);
    }
    th:last-child {
      text-align: right;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 12px;
      color: #475569;
    }
    tbody tr:nth-child(even) {
      background-color: #f8fafc;
    }
    tbody tr:hover {
      background-color: #f1f5f9;
    }
    tbody tr:last-child td {
      border-bottom: none;
    }
    td:last-child {
      text-align: right;
    }
    .amount {
      font-weight: 700;
      font-size: 13px;
    }
    .amount.positive {
      color: #10b981;
    }
    .amount.negative {
      color: #ef4444;
    }
    .no-transactions {
      text-align: center;
      padding: 25px;
      color: #94a3b8;
      font-style: italic;
      background-color: #f8fafc;
      border-radius: 6px;
      border: 1px dashed #e2e8f0;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px;
      text-align: center;
      border-top: 2px solid #e2e8f0;
      margin-top: 20px;
      border-radius: 0 0 8px 8px;
    }
    .footer-text {
      font-size: 11px;
      color: #94a3b8;
      margin: 4px 0;
    }
    @media print {
      body {
        padding: 10px;
      }
      .category-card {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Monthly Budget Report</h1>
    <h2>${monthName}</h2>
  </div>

  <div class="summary-section">
    <div class="summary-title">Financial Summary</div>
    <div class="summary-grid">
      <div class="summary-card income">
        <div class="summary-label">Total Income</div>
        <div class="summary-value">${formatCurrency(report.totalIncome)}</div>
      </div>
      <div class="summary-card budget">
        <div class="summary-label">Total Budget</div>
        <div class="summary-value">${formatCurrency(report.totalBudget)}</div>
      </div>
      <div class="summary-card spent">
        <div class="summary-label">Total Spent</div>
        <div class="summary-value">${formatCurrency(report.totalSpent)}</div>
      </div>
      <div class="summary-card balance">
        <div class="summary-label">Remaining</div>
        <div class="summary-value">${formatCurrency(report.remainingBalance)}</div>
      </div>
    </div>
    ${report.totalBudget > 0 ? `
    <div class="progress-container">
      <div class="progress-label">
        <span>Budget Utilization</span>
        <span>${spentPercentage.toFixed(1)}%</span>
      </div>
      <div class="progress-bar-wrapper">
        <div class="progress-bar" style="width: ${Math.min(spentPercentage, 100)}%">
          ${spentPercentage > 5 ? spentPercentage.toFixed(0) + '%' : ''}
        </div>
      </div>
    </div>
    ` : ''}
  </div>

  <div class="category-section">
`;

  // Income Transactions
  if (report.incomeTransactions.length > 0) {
    html += `
    <div class="category-card">
      <div class="category-header">
        <span class="category-icon">💰</span>
        <span class="category-name">Income Transactions</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
`;
    report.incomeTransactions.forEach(transaction => {
      html += `
          <tr>
            <td>${formatDate(transaction.date)}</td>
            <td>${(transaction.description || 'N/A').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
            <td class="amount positive">${formatCurrency(transaction.amount)}</td>
          </tr>
`;
    });
    html += `
        </tbody>
      </table>
    </div>
`;
  }

  // Expense Categories
  report.categories.forEach(category => {
    if (category.transactions.length > 0 || category.budget > 0) {
      const categoryRemaining = category.budget - category.spent;
      const categoryPercentage = category.budget > 0 ? (category.spent / category.budget) * 100 : 0;
      
      html += `
    <div class="category-card">
      <div class="category-header">
        <span class="category-icon">${category.icon}</span>
        <span class="category-name">${category.name}</span>
      </div>
      <div class="category-stats">
        <div class="stat-item">
          <div class="stat-label">Budget</div>
          <div class="stat-value">${formatCurrency(category.budget)}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Spent</div>
          <div class="stat-value" style="color: ${category.spent > category.budget ? '#ef4444' : '#475569'}">${formatCurrency(category.spent)}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Remaining</div>
          <div class="stat-value" style="color: ${categoryRemaining >= 0 ? '#10b981' : '#ef4444'}">${formatCurrency(categoryRemaining)}</div>
        </div>
      </div>
`;

      if (category.budget > 0) {
        html += `
      <div class="progress-container">
        <div class="progress-label">
          <span>Usage</span>
          <span>${categoryPercentage.toFixed(1)}%</span>
        </div>
        <div class="progress-bar-wrapper">
          <div class="progress-bar" style="width: ${Math.min(categoryPercentage, 100)}%; background: ${categoryPercentage > 100 ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(90deg, #10b981 0%, #059669 100%)'};">
            ${categoryPercentage > 5 ? categoryPercentage.toFixed(0) + '%' : ''}
          </div>
        </div>
      </div>
`;
      }

      if (category.transactions.length > 0) {
        html += `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
`;
        category.transactions.forEach(transaction => {
          html += `
          <tr>
            <td>${formatDate(transaction.date)}</td>
            <td>${(transaction.description || 'N/A').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
            <td class="amount negative">${formatCurrency(transaction.amount)}</td>
          </tr>
`;
        });
        html += `
        </tbody>
      </table>
`;
      } else {
        html += `
      <div class="no-transactions">
        No transactions recorded this month
      </div>
`;
      }

      html += `
    </div>
`;
    }
  });

  html += `
  </div>

  <div class="footer">
    <div class="footer-text">Generated automatically by <strong>VStack Budget Planner</strong></div>
    <div class="footer-text">Report Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>
</body>
</html>
`;

  return html;
};

/**
 * Generate PDF file from monthly report
 */
export const generatePDFReport = async (report: MonthlyReport): Promise<string> => {
  try {
    const html = generatePDFHTML(report);
    
    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    return uri;
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error?.message || 'Unknown error'}`);
  }
};
