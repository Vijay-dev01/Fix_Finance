import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useBudget } from '../context/BudgetContext';
import { theme } from '../theme';
import { formatCurrency } from '../constants/categories';
import { Transaction } from '../types';

type RowItem = {
  key: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryLabel: string;
  categoryIcon: string;
};

const formatDateTime = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const TransactionsScreen: React.FC = () => {
  const { state } = useBudget();

  const rows = useMemo(() => {
    const list: RowItem[] = [];

    state.incomeTransactions.forEach((t: Transaction) => {
      list.push({
        key: `income-${t.id}`,
        date: t.date,
        description: t.description || '—',
        amount: t.amount,
        type: 'income',
        categoryLabel: 'Income',
        categoryIcon: '💵',
      });
    });

    state.categories.forEach(cat => {
      cat.transactions.forEach((t: Transaction) => {
        list.push({
          key: `exp-${t.id}-${cat.id}`,
          date: t.date,
          description: t.description || '—',
          amount: t.amount,
          type: 'expense',
          categoryLabel: cat.name,
          categoryIcon: cat.icon,
        });
      });
    });

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [state.categories, state.incomeTransactions]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Newest first — see when you added or updated amounts
        </Text>

        {rows.length === 0 ? (
          <Card style={styles.emptyCard} mode="outlined">
            <Card.Content>
              <Text style={styles.emptyText}>No transactions this month yet.</Text>
              <Text style={styles.emptyHint}>
                Add income or expenses from the Dashboard.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          rows.map(row => (
            <Card key={row.key} style={styles.card} mode="outlined">
              <Card.Content>
                <View style={styles.rowTop}>
                  <Text style={styles.dateText}>{formatDateTime(row.date)}</Text>
                  <Text
                    style={[
                      styles.amount,
                      row.type === 'income' ? styles.amountIncome : styles.amountExpense,
                    ]}
                  >
                    {row.type === 'income' ? '+' : '−'}
                    {formatCurrency(row.amount)}
                  </Text>
                </View>
                <Text style={styles.description} numberOfLines={3}>
                  {row.description}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaIcon}>{row.categoryIcon}</Text>
                  <Text style={styles.metaLabel}>
                    {row.type === 'income' ? 'Income' : row.categoryLabel}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceVariant,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  amountIncome: {
    color: theme.colors.success,
  },
  amountExpense: {
    color: theme.colors.error,
  },
  description: {
    fontSize: 16,
    color: theme.colors.onSurface,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceVariant,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default TransactionsScreen;
