import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, ProgressBar } from 'react-native-paper';
import { Category } from '../types';
import { formatCurrency } from '../constants/categories';
import { theme } from '../theme';

interface BudgetProgressCardProps {
  category: Category;
  onPress?: () => void;
}

const BudgetProgressCard: React.FC<BudgetProgressCardProps> = ({
  category,
  onPress,
}) => {
  const percentage = category.budget > 0 
    ? Math.min((category.spent / category.budget) * 100, 100) 
    : 0;
  const remaining = category.budget - category.spent;
  const isOverBudget = category.spent > category.budget;

  return (
    <Card 
      style={styles.card} 
      onPress={onPress}
      mode="outlined"
    >
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.icon}>{category.icon}</Text>
          <View style={styles.headerText}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.transactionCount}>
              {category.transactions.length} transactions
            </Text>
          </View>
        </View>

        <View style={styles.budgetInfo}>
          <View style={styles.amountRow}>
            <Text style={styles.label}>Budget:</Text>
            <Text style={styles.amount}>{formatCurrency(category.budget)}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.label}>Spent:</Text>
            <Text style={[styles.amount, isOverBudget && styles.overBudget]}>
              {formatCurrency(category.spent)}
            </Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.label}>Remaining:</Text>
            <Text style={[styles.amount, remaining < 0 && styles.overBudget]}>
              {formatCurrency(remaining)}
            </Text>
          </View>
        </View>

        {category.budget > 0 && (
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={percentage / 100}
              color={isOverBudget ? theme.colors.error : theme.colors.primary}
              style={styles.progressBar}
            />
            <Text style={styles.percentage}>{percentage.toFixed(1)}%</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceVariant,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  transactionCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  budgetInfo: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  overBudget: {
    color: theme.colors.error,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  percentage: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    minWidth: 50,
    textAlign: 'right',
  },
});

export default BudgetProgressCard;

