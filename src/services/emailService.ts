import * as MailComposer from 'expo-mail-composer';
import { MonthlyReport, generateEmailBody, generatePlainTextBody } from './monthlyReportService';
import { generatePDFReport } from './pdfReportService';

const RECIPIENT_EMAIL = 'vijayajay3535@gmail.com';

/**
 * Check if mail composer is available on the device
 */
export const isMailAvailable = async (): Promise<boolean> => {
  try {
    return await MailComposer.isAvailableAsync();
  } catch (error) {
    console.error('Error checking mail availability:', error);
    return false;
  }
};

/**
 * Send monthly report via email using device mail app with PDF attachment
 * Note: This requires user interaction to send the email
 */
export const sendMonthlyReportEmail = async (
  report: MonthlyReport
): Promise<{ success: boolean; error?: string }> => {
  try {
    const available = await isMailAvailable();
    
    if (!available) {
      return {
        success: false,
        error: 'Mail composer is not available on this device',
      };
    }

    const monthName = report.month.split('-').reverse().join('-');
    const subject = `Monthly Budget Report - ${monthName}`;
    
    // Generate PDF report
    let pdfUri: string | undefined;
    try {
      pdfUri = await generatePDFReport(report);
    } catch (pdfError: any) {
      console.error('Error generating PDF, sending email without attachment:', pdfError);
      // Continue without PDF if generation fails
    }

    // Generate email body
    const htmlBody = generateEmailBody(report);
    const plainTextBody = generatePlainTextBody(report);

    // Prepare email with PDF attachment if available
    const emailOptions: MailComposer.MailComposerOptions = {
      recipients: [RECIPIENT_EMAIL],
      subject,
      body: pdfUri 
        ? `Please find the detailed monthly budget report attached as PDF.\n\n${plainTextBody}`
        : htmlBody,
      isHtml: !pdfUri, // Use plain text if PDF is attached, HTML otherwise
      attachments: pdfUri ? [pdfUri] : undefined,
    };

    const result = await MailComposer.composeAsync(emailOptions);

    // MailComposer result: 'sent' means user sent it, 'saved' means saved as draft, 'cancelled' means cancelled
    if (result.status === 'sent') {
      return { success: true };
    } else if (result.status === 'saved') {
      return {
        success: false,
        error: 'Email was saved as draft but not sent',
      };
    } else {
      return {
        success: false,
        error: 'Email sending was cancelled',
      };
    }
  } catch (error: any) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error?.message || 'Failed to send email',
    };
  }
};

/**
 * Alternative: Send email via EmailJS (requires EmailJS account setup)
 * This allows fully automated email sending without user interaction
 * 
 * To use this:
 * 1. Sign up at https://www.emailjs.com/
 * 2. Create an email service and template
 * 3. Get your Public Key, Service ID, and Template ID
 * 4. Install: npm install @emailjs/browser
 * 5. Uncomment and configure the function below
 */
/*
import emailjs from '@emailjs/browser';

export const sendMonthlyReportEmailAutomated = async (
  report: MonthlyReport
): Promise<{ success: boolean; error?: string }> => {
  try {
    const monthName = report.month.split('-').reverse().join('-');
    const htmlBody = generateEmailBody(report);
    const plainTextBody = generatePlainTextBody(report);

    const templateParams = {
      to_email: RECIPIENT_EMAIL,
      subject: `Monthly Budget Report - ${monthName}`,
      html_content: htmlBody,
      text_content: plainTextBody,
      month: monthName,
      total_income: report.totalIncome,
      total_spent: report.totalSpent,
      remaining_balance: report.remainingBalance,
    };

    const result = await emailjs.send(
      'YOUR_SERVICE_ID',      // Replace with your EmailJS Service ID
      'YOUR_TEMPLATE_ID',     // Replace with your EmailJS Template ID
      templateParams,
      'YOUR_PUBLIC_KEY'       // Replace with your EmailJS Public Key
    );

    if (result.status === 200) {
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Failed to send email via EmailJS',
      };
    }
  } catch (error: any) {
    console.error('Error sending email via EmailJS:', error);
    return {
      success: false,
      error: error?.message || 'Failed to send email',
    };
  }
};
*/
