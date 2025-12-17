import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  SegmentedButtons,
  Card,
  RadioButton,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useBudget } from '../context/BudgetContext';
import { TransactionType } from '../types';
import { theme } from '../theme';
import { INITIAL_CATEGORIES } from '../constants/categories';

const AddTransactionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { state, addTransaction } = useBudget();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleAddTransaction = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please enter a description.');
      return;
    }

    if (type === 'expense' && !selectedCategory) {
      Alert.alert('Missing Category', 'Please select a category for expenses.');
      return;
    }

    addTransaction({
      type,
      amount: parseFloat(amount),
      category: type === 'expense' ? selectedCategory : 'income',
      description: description.trim(),
    });

    // Reset form
    setAmount('');
    setDescription('');
    setSelectedCategory('');
    setType('expense');

    Alert.alert('Success', 'Transaction added successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Transaction Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaction Type</Text>
            <SegmentedButtons
              value={type}
              onValueChange={(value) => {
                setType(value as TransactionType);
                if (value === 'income') {
                  setSelectedCategory('');
                }
              }}
              buttons={[
                {
                  value: 'expense',
                  label: 'Expense',
                  icon: 'minus-circle',
                },
                {
                  value: 'income',
                  label: 'Income',
                  icon: 'plus-circle',
                },
              ]}
              style={styles.segmentedButtons}
            />
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor={theme.colors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter description"
              placeholderTextColor={theme.colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Category (only for expenses) */}
          {type === 'expense' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <Card style={styles.categoryCard} mode="outlined">
                <Card.Content>
                  <RadioButton.Group
                    onValueChange={setSelectedCategory}
                    value={selectedCategory}
                  >
                    {state.categories.map(category => (
                      <View key={category.id} style={styles.radioOption}>
                        <RadioButton
                          value={category.id}
                          color={theme.colors.primary}
                        />
                        <Text
                          style={styles.radioLabel}
                          onPress={() => setSelectedCategory(category.id)}
                        >
                          {category.icon} {category.name}
                        </Text>
                      </View>
                    ))}
                  </RadioButton.Group>
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Add Button */}
          <Button
            mode="contained"
            onPress={handleAddTransaction}
            style={styles.addButton}
            contentStyle={styles.addButtonContent}
            labelStyle={styles.addButtonLabel}
          >
            Add Transaction
          </Button>
        </View>
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
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  segmentedButtons: {
    backgroundColor: theme.colors.surface,
  },
  input: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: theme.colors.onSurface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceVariant,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceVariant,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioLabel: {
    fontSize: 16,
    color: theme.colors.onSurface,
    marginLeft: 8,
  },
  addButton: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
  },
  addButtonContent: {
    paddingVertical: 8,
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddTransactionScreen;

