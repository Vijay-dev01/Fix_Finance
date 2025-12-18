import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Switch,
  List,
  Divider,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { useBudget } from '../context/BudgetContext';
import { SMSReader } from '../services/smsReader';
import { SMSParser, ParsedSMS } from '../services/smsParser';
import { theme, colors } from '../theme';
import { formatCurrency } from '../constants/categories';

const SMSTrackingScreen: React.FC = () => {
  const { addTransaction, state } = useBudget();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedSMS[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const hasPerm = await SMSReader.hasPermissions();
    setHasPermission(hasPerm);
    if (hasPerm) {
      loadTransactionSMS();
    }
  };

  const requestPermissions = async () => {
    const granted = await SMSReader.requestPermissions();
    setHasPermission(granted);
    if (granted) {
      loadTransactionSMS();
    }
  };

  const loadTransactionSMS = async () => {
    setIsLoading(true);
    try {
      const transactions = await SMSReader.getTransactionSMS(50);
      setParsedTransactions(transactions);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('SMS module not available')) {
        Alert.alert(
          'Native Module Required',
          'SMS tracking requires a custom build. Please build the app using:\n\n• Development: npx expo run:android\n• Production: npm run build:android\n\nExpo Go does not support native SMS modules.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', `Failed to read SMS: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactionSMS();
    setRefreshing(false);
  };

  const handleAddTransaction = (parsed: ParsedSMS) => {
    addTransaction({
      type: parsed.type,
      amount: parsed.amount,
      category: parsed.category || (parsed.type === 'expense' ? 'unknown-expenses' : 'income'),
      description: parsed.description,
    });

    Alert.alert('Success', 'Transaction added from SMS!');
    
    // Remove from list
    setParsedTransactions(prev => prev.filter(t => t !== parsed));
  };

  const handleAddAll = () => {
    if (parsedTransactions.length === 0) {
      Alert.alert('No Transactions', 'No transactions to add');
      return;
    }

    Alert.alert(
      'Add All Transactions',
      `Add ${parsedTransactions.length} transactions?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add All',
          onPress: () => {
            parsedTransactions.forEach(handleAddTransaction);
            setParsedTransactions([]);
            Alert.alert('Success', 'All transactions added!');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Card */}
        <Card style={styles.headerCard} mode="outlined">
          <Card.Content>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>SMS Expense Tracking</Text>
              <Switch
                value={isEnabled && hasPermission}
                onValueChange={(value) => {
                  if (!hasPermission) {
                    requestPermissions();
                  } else {
                    setIsEnabled(value);
                    if (value) {
                      loadTransactionSMS();
                    }
                  }
                }}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.headerSubtitle}>
              Automatically track expenses from bank SMS
            </Text>

            {!hasPermission && (
              <Button
                mode="contained"
                onPress={requestPermissions}
                style={styles.permissionButton}
              >
                Grant SMS Permission
              </Button>
            )}

            {hasPermission && (
              <View style={styles.statsRow}>
                <Chip icon="message-text" style={styles.chip}>
                  {parsedTransactions.length} Found
                </Chip>
                <Button
                  mode="outlined"
                  onPress={loadTransactionSMS}
                  loading={isLoading}
                  disabled={isLoading}
                  compact
                >
                  Refresh
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Instructions */}
        {hasPermission && parsedTransactions.length === 0 && !isLoading && (
          <Card style={styles.infoCard} mode="outlined">
            <Card.Content>
              <Text style={styles.infoTitle}>How it works:</Text>
              <Text style={styles.infoText}>
                • The app reads your recent SMS messages{'\n'}
                • Identifies transaction SMS from banks{'\n'}
                • Extracts amount, description, and category{'\n'}
                • You can review and add transactions manually
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Loading */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Reading SMS...</Text>
          </View>
        )}

        {/* Transactions List */}
        {parsedTransactions.length > 0 && (
          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Found Transactions ({parsedTransactions.length})
              </Text>
              <Button
                mode="contained"
                onPress={handleAddAll}
                compact
                style={styles.addAllButton}
              >
                Add All
              </Button>
            </View>

            {parsedTransactions.map((parsed, index) => (
              <Card
                key={index}
                style={styles.transactionCard}
                mode="outlined"
              >
                <Card.Content>
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionAmount}>
                        {formatCurrency(parsed.amount)}
                      </Text>
                      <Chip
                        style={[
                          styles.typeChip,
                          parsed.type === 'income'
                            ? styles.incomeChip
                            : styles.expenseChip,
                        ]}
                        textStyle={styles.chipText}
                      >
                        {parsed.type === 'income' ? 'Income' : 'Expense'}
                      </Chip>
                    </View>
                    {parsed.category && (
                      <Chip style={styles.categoryChip} compact>
                        {
                          state.categories.find(c => c.id === parsed.category)
                            ?.name || parsed.category
                        }
                      </Chip>
                    )}
                  </View>

                  <Text style={styles.transactionDescription}>
                    {parsed.description}
                  </Text>

                  {parsed.merchant && (
                    <Text style={styles.transactionMerchant}>
                      Merchant: {parsed.merchant}
                    </Text>
                  )}

                  <Button
                    mode="contained"
                    onPress={() => handleAddTransaction(parsed)}
                    style={styles.addButton}
                    compact
                  >
                    Add Transaction
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceVariant,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  permissionButton: {
    marginTop: 12,
    backgroundColor: theme.colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  chip: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceVariant,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
  },
  transactionsSection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  addAllButton: {
    backgroundColor: theme.colors.primary,
  },
  transactionCard: {
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceVariant,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  typeChip: {
    alignSelf: 'flex-start',
  },
  incomeChip: {
    backgroundColor: theme.colors.success + '40',
  },
  expenseChip: {
    backgroundColor: theme.colors.error + '40',
  },
  chipText: {
    fontSize: 12,
  },
  categoryChip: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  transactionDescription: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  transactionMerchant: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  addButton: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
  },
});

export default SMSTrackingScreen;

