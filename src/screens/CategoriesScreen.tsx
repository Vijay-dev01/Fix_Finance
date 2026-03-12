import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Button,
  Dialog,
  Portal,
  SegmentedButtons,
  FAB,
} from 'react-native-paper';
import { useBudget } from '../context/BudgetContext';
import BudgetProgressCard from '../components/BudgetProgressCard';
import { theme } from '../theme';
import { formatCurrency, CATEGORY_ICON_OPTIONS } from '../constants/categories';

const CategoriesScreen: React.FC = () => {
  const { state, setBudget, setSpent, addCategory, deleteCategory } = useBudget();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'budget' | 'spent'>('budget');
  const [amount, setAmount] = useState('');
  const [addDialogVisible, setAddDialogVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICON_OPTIONS[0].emoji);

  const handleEditBudget = (categoryId: string, currentBudget: number) => {
    setEditingCategory(categoryId);
    setEditMode('budget');
    setAmount(currentBudget.toString());
  };

  const handleEditSpent = (categoryId: string, currentSpent: number) => {
    setEditingCategory(categoryId);
    setEditMode('spent');
    setAmount(currentSpent.toString());
  };

  const handleSave = () => {
    if (editingCategory) {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue < 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid amount.');
        return;
      }
      
      if (editMode === 'budget') {
        setBudget(editingCategory, amountValue);
      } else {
        setSpent(editingCategory, amountValue);
      }
      
      setEditingCategory(null);
      setAmount('');
      setEditMode('budget');
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setAmount('');
    setEditMode('budget');
  };

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) {
      Alert.alert('Missing name', 'Please enter a category name.');
      return;
    }
    addCategory(name, selectedIcon);
    setAddDialogVisible(false);
    setNewCategoryName('');
    setSelectedIcon(CATEGORY_ICON_OPTIONS[0].emoji);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const cat = state.categories.find(c => c.id === categoryId);
    if (!cat) return;
    if (cat.transactions.length > 0) {
      Alert.alert(
        'Cannot delete',
        'Remove or reassign transactions from this category before deleting it.'
      );
      return;
    }
    Alert.alert(
      'Delete category',
      `Delete "${cat.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCategory(categoryId) },
      ]
    );
  };

  const sortedCategories = [...state.categories].sort((a, b) => {
    // Sort by budget amount (highest first), then by name
    if (b.budget !== a.budget) {
      return b.budget - a.budget;
    }
    return a.name.localeCompare(b.name);
  });

  const isEmpty = state.categories.length === 0;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Budget Categories</Text>
          <Text style={styles.headerSubtitle}>
            {isEmpty
              ? 'Add categories to start budgeting'
              : `${state.categories.filter(cat => cat.budget > 0).length} of ${state.categories.length} categories configured`}
          </Text>
        </View>

        {!isEmpty && (
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
        )}

        {isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>No categories yet</Text>
            <Text style={styles.emptySubtitle}>
              After monthly reset you can create your own budget categories. Add your first one to get started.
            </Text>
            <Button
              mode="contained"
              onPress={() => setAddDialogVisible(true)}
              style={styles.emptyButton}
              icon="plus"
            >
              Add your first category
            </Button>
          </View>
        ) : (
        <View style={styles.categoriesContainer}>
          {sortedCategories.map(category => (
            <View key={category.id} style={styles.categoryWrapper}>
              <BudgetProgressCard
                category={category}
                onPress={() =>
                  handleEditBudget(category.id, category.budget)
                }
              />
              <View style={styles.buttonRow}>
                <Button
                  mode="outlined"
                  onPress={() => handleEditBudget(category.id, category.budget)}
                  style={styles.editButton}
                  compact
                >
                  Edit Budget
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleEditSpent(category.id, category.spent)}
                  style={styles.editButton}
                  compact
                >
                  Edit Spent
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleDeleteCategory(category.id)}
                  style={[styles.editButton, styles.deleteButton]}
                  compact
                  textColor={theme.colors.error}
                >
                  Delete
                </Button>
              </View>
            </View>
          ))}
        </View>
        )}
      </ScrollView>

      {!isEmpty && (
        <FAB
          style={styles.fab}
          icon="plus"
          label="Add category"
          onPress={() => setAddDialogVisible(true)}
        />
      )}

      {/* Add Category Dialog */}
      <Portal>
        <Dialog
          visible={addDialogVisible}
          onDismiss={() => {
            setAddDialogVisible(false);
            setNewCategoryName('');
            setSelectedIcon(CATEGORY_ICON_OPTIONS[0].emoji);
          }}
          style={styles.dialog}
        >
          <Dialog.Title>New category</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Groceries, Rent"
              placeholderTextColor={theme.colors.textSecondary}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
            />
            <Text style={[styles.dialogLabel, { marginTop: 16 }]}>Icon</Text>
            <View style={styles.iconGrid}>
              {CATEGORY_ICON_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.iconOption,
                    selectedIcon === opt.emoji && styles.iconOptionSelected,
                  ]}
                  onPress={() => setSelectedIcon(opt.emoji)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.iconEmoji}>{opt.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleAddCategory} mode="contained">
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog
          visible={editingCategory !== null}
          onDismiss={handleCancelEdit}
          style={styles.dialog}
        >
          <Dialog.Title>
            Edit {editMode === 'budget' ? 'Budget' : 'Spent'}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              {editingCategory &&
                state.categories.find(c => c.id === editingCategory)?.name}
            </Text>
            
            <SegmentedButtons
              value={editMode}
              onValueChange={(value) => {
                setEditMode(value as 'budget' | 'spent');
                const category = state.categories.find(
                  c => c.id === editingCategory
                );
                if (category) {
                  setAmount(
                    value === 'budget'
                      ? category.budget.toString()
                      : category.spent.toString()
                  );
                }
              }}
              buttons={[
                {
                  value: 'budget',
                  label: 'Budget',
                  icon: 'wallet',
                },
                {
                  value: 'spent',
                  label: 'Spent',
                  icon: 'cash',
                },
              ]}
              style={styles.segmentedButtons}
            />

            <TextInput
              style={styles.input}
              placeholder={`Enter ${editMode} amount`}
              placeholderTextColor={theme.colors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              autoFocus
            />
            
            {editMode === 'spent' && (
              <Text style={styles.warningText}>
                Note: This will override the calculated spent amount from transactions.
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCancelEdit}>Cancel</Button>
            <Button onPress={handleSave} mode="contained">
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
    paddingBottom: 80,
  },
  categoryWrapper: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  editButton: {
    marginLeft: 8,
    minWidth: 100,
  },
  deleteButton: {
    borderColor: theme.colors.error,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  emptyState: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  emptyButton: {
    marginTop: 8,
  },
  dialogLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOptionSelected: {
    backgroundColor: theme.colors.primaryContainer,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  iconEmoji: {
    fontSize: 24,
  },
  dialog: {
    backgroundColor: theme.colors.surface,
  },
  dialogText: {
    fontSize: 16,
    color: theme.colors.onSurface,
    marginBottom: 16,
  },
  segmentedButtons: {
    marginVertical: 16,
    backgroundColor: theme.colors.surfaceVariant,
  },
  input: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.colors.onSurface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceVariant,
    marginTop: 8,
  },
  warningText: {
    fontSize: 12,
    color: theme.colors.warning,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default CategoriesScreen;

