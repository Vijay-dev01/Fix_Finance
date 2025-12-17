import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Text, Button, Dialog, Portal, Divider } from 'react-native-paper';
import { useBudget } from '../context/BudgetContext';
import BudgetProgressCard from '../components/BudgetProgressCard';
import { theme } from '../theme';
import { formatCurrency } from '../constants/categories';

const CategoriesScreen: React.FC = () => {
  const { state, setBudget } = useBudget();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');

  const handleEditCategory = (categoryId: string, currentBudget: number) => {
    setEditingCategory(categoryId);
    setBudgetAmount(currentBudget.toString());
  };

  const handleSaveBudget = () => {
    if (editingCategory) {
      const amount = parseFloat(budgetAmount);
      if (isNaN(amount) || amount < 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid budget amount.');
        return;
      }
      setBudget(editingCategory, amount);
      setEditingCategory(null);
      setBudgetAmount('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setBudgetAmount('');
  };

  const sortedCategories = [...state.categories].sort((a, b) => {
    // Sort by budget amount (highest first), then by name
    if (b.budget !== a.budget) {
      return b.budget - a.budget;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Budget Categories</Text>
          <Text style={styles.headerSubtitle}>
            {state.categories.filter(cat => cat.budget > 0).length} of{' '}
            {state.categories.length} categories configured
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Budget:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(state.totalBudget)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Spent:</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.error }]}>
              {formatCurrency(state.totalSpent)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Remaining:</Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    state.remainingBalance >= 0
                      ? theme.colors.success
                      : theme.colors.error,
                },
              ]}
            >
              {formatCurrency(state.remainingBalance)}
            </Text>
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          {sortedCategories.map(category => (
            <View key={category.id} style={styles.categoryWrapper}>
              <BudgetProgressCard
                category={category}
                onPress={() =>
                  handleEditCategory(category.id, category.budget)
                }
              />
              <Button
                mode="outlined"
                onPress={() => handleEditCategory(category.id, category.budget)}
                style={styles.editButton}
                compact
              >
                Edit Budget
              </Button>
            </View>
          ))}
        </View>
      </ScrollView>

      <Portal>
        <Dialog
          visible={editingCategory !== null}
          onDismiss={handleCancelEdit}
          style={styles.dialog}
        >
          <Dialog.Title>Edit Budget</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              {editingCategory &&
                state.categories.find(c => c.id === editingCategory)?.name}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter budget amount"
              placeholderTextColor={theme.colors.textSecondary}
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              keyboardType="numeric"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCancelEdit}>Cancel</Button>
            <Button onPress={handleSaveBudget} mode="contained">
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.surfaceVariant,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  categoriesContainer: {
    padding: 16,
    paddingTop: 0,
  },
  categoryWrapper: {
    marginBottom: 16,
  },
  editButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  dialog: {
    backgroundColor: theme.colors.surface,
  },
  dialogText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    marginBottom: 16,
  },
  input: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.colors.onSurface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceVariant,
  },
});

export default CategoriesScreen;

