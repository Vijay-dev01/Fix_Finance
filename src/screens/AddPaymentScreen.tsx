import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Text, Button, SegmentedButtons, Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { usePayments } from '../context/PaymentContext';
import { PaymentType } from '../types/payments';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';

type AddPaymentRoute = RouteProp<RootStackParamList, 'AddPayment'>;

const toDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDateString = (value: string): Date => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const AddPaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddPaymentRoute>();
  const { state, addPayment, updatePayment } = usePayments();
  const paymentId = route.params?.paymentId;
  const existing = useMemo(
    () => state.payments.find(p => p.id === paymentId),
    [state.payments, paymentId]
  );
  const isEditing = Boolean(existing);

  const [type, setType] = useState<PaymentType>('get');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(toDateString(new Date()));
  const [note, setNote] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  useEffect(() => {
    if (!existing) return;
    setType(existing.type);
    setPersonName(existing.personName);
    setAmount(String(existing.amount));
    setDueDate(existing.dueDate);
    setNote(existing.note ?? '');
    setPickerDate(parseDateString(existing.dueDate));
    navigation.setOptions({ title: 'Edit Payment' });
  }, [existing, navigation]);

  const handleSave = async () => {
    const amountValue = parseFloat(amount);
    if (!personName.trim()) {
      Alert.alert('Missing name', 'Please enter a person or name.');
      return;
    }
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }
    if (!dueDate) {
      Alert.alert('Missing due date', 'Please select a due date.');
      return;
    }

    const payload = {
      type,
      personName: personName.trim(),
      amount: amountValue,
      dueDate,
      note: note.trim() || undefined,
    };

    if (isEditing && paymentId) {
      await updatePayment(paymentId, payload);
    } else {
      await addPayment(payload);
    }
    navigation.goBack();
  };

  const onDateChange = (_event: unknown, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) {
      setPickerDate(selected);
      setDueDate(toDateString(selected));
    }
  };

  const formattedDue = parseDateString(dueDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Type</Text>
        <SegmentedButtons
          value={type}
          onValueChange={v => setType(v as PaymentType)}
          buttons={[
            { value: 'get', label: 'Get' },
            { value: 'give', label: 'Give' },
          ]}
          style={styles.segmented}
        />

        <Text style={styles.label}>Person / Name</Text>
        <TextInput
          style={styles.input}
          value={personName}
          onChangeText={setPersonName}
          placeholder="e.g. Rahul"
          placeholderTextColor={theme.colors.textSecondary}
        />

        <Text style={styles.label}>Amount (₹)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="5000"
          placeholderTextColor={theme.colors.textSecondary}
        />

        <Text style={styles.label}>Due date</Text>
        <TouchableOpacity onPress={() => setShowPicker(true)}>
          <Card style={styles.dateCard} mode="outlined">
            <Card.Content>
              <Text style={styles.dateText}>{formattedDue}</Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}

        {Platform.OS === 'ios' && showPicker && (
          <Button mode="text" onPress={() => setShowPicker(false)}>
            Done
          </Button>
        )}

        <Text style={styles.label}>Note (optional)</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          value={note}
          onChangeText={setNote}
          placeholder="Add a note..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
        />

        <Button mode="contained" onPress={handleSave} style={styles.saveBtn}>
          {isEditing ? 'Save Changes' : 'Add Payment'}
        </Button>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          Cancel
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  segmented: {
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceVariant,
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  saveBtn: {
    marginTop: 24,
    backgroundColor: theme.colors.primary,
  },
  cancelBtn: {
    marginTop: 8,
  },
});

export default AddPaymentScreen;
