import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { SMSParser, ParsedSMS } from './smsParser';

// Import SMS reader - using require for native module
let SMS: any;
try {
  SMS = require('react-native-get-sms-android');
} catch (e) {
  console.warn('SMS module not available:', e);
}

export interface SMSMessage {
  _id: string;
  address: string;
  body: string;
  date: number;
  date_sent?: number;
  read?: number;
  seen?: number;
  status?: number;
  type?: number;
}

export class SMSReader {
  /**
   * Request SMS permissions
   */
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      Alert.alert('Not Supported', 'SMS reading is only available on Android');
      return false;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'VStack needs access to your SMS to automatically track expenses',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert('Permission Denied', 'SMS permission is required for automatic expense tracking');
        return false;
      }
    } catch (err) {
      console.error('Error requesting SMS permission:', err);
      return false;
    }
  }

  /**
   * Check if SMS permissions are granted
   */
  static async hasPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_SMS
      );
      return result;
    } catch (err) {
      console.error('Error checking SMS permission:', err);
      return false;
    }
  }

  /**
   * Read recent SMS messages
   */
  static async readRecentSMS(limit: number = 50): Promise<SMSMessage[]> {
    if (Platform.OS !== 'android') {
      return [];
    }

    if (!SMS) {
      throw new Error('SMS module not available. Please build the app with native modules (use "npx expo run:android" or build APK).');
    }

    const hasPermission = await this.hasPermissions();
    if (!hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) {
        return [];
      }
    }

    return new Promise((resolve, reject) => {
      const filter = {
        box: 'inbox', // 'inbox' (default), 'sent', 'draft', 'outbox', 'failed', 'queued'
        maxCount: limit,
      };

      SMS.list(
        JSON.stringify(filter),
        (fail: string) => {
          console.error('Failed to read SMS:', fail);
          reject(new Error(fail));
        },
        (count: number, smsList: string) => {
          try {
            const messages: SMSMessage[] = JSON.parse(smsList);
            resolve(messages);
          } catch (err) {
            console.error('Error parsing SMS list:', err);
            reject(err);
          }
        }
      );
    });
  }

  /**
   * Read and parse transaction SMS
   */
  static async getTransactionSMS(limit: number = 50): Promise<ParsedSMS[]> {
    try {
      const messages = await this.readRecentSMS(limit);
      const transactions: ParsedSMS[] = [];

      for (const message of messages) {
        if (SMSParser.isTransactionSMS(message.body, message.address)) {
          const parsed = SMSParser.parseSMS(message.body, message.address);
          if (parsed) {
            transactions.push(parsed);
          }
        }
      }

      return transactions;
    } catch (error) {
      console.error('Error reading transaction SMS:', error);
      return [];
    }
  }

  /**
   * Monitor new SMS messages (requires background service)
   */
  static startMonitoring(
    onNewTransaction: (transaction: ParsedSMS) => void
  ): () => void {
    // This would require a background service implementation
    // For now, we'll use periodic checks
    const interval = setInterval(async () => {
      try {
        const recentTransactions = await this.getTransactionSMS(10);
        if (recentTransactions.length > 0) {
          recentTransactions.forEach(onNewTransaction);
        }
      } catch (error) {
        console.error('Error monitoring SMS:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }
}

