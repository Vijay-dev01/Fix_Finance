import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { CATEGORY_ICON_OPTIONS } from '../constants/categories';

interface AddCategoryModalProps {
  visible: boolean;
  onDismiss: () => void;
  onAdd: () => void;
  name: string;
  onNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  selectedIcon: string;
  onSelectIcon: (emoji: string) => void;
  keyboardEmoji: string;
  onKeyboardEmojiChange: (value: string) => void;
}

const H = 20;

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  visible,
  onDismiss,
  onAdd,
  name,
  onNameChange,
  description,
  onDescriptionChange,
  selectedIcon,
  onSelectIcon,
  keyboardEmoji,
  onKeyboardEmojiChange,
}) => {
  const previewIcon = keyboardEmoji.trim() || selectedIcon;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={onDismiss} />

          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.titleBlock}>
                <Text style={styles.title}>New category</Text>
                <Text style={styles.subtitle}>Set a name, icon, and optional notes</Text>
              </View>
              <TouchableOpacity
                onPress={onDismiss}
                style={styles.closeHit}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.form}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionLabel}>NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Stocks, Groceries"
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={onNameChange}
                autoFocus
              />

              <View style={styles.iconSectionHeader}>
                <Text style={styles.sectionLabel}>ICON</Text>
                <View style={styles.iconPreview}>
                  <Text style={styles.iconPreviewEmoji}>{previewIcon}</Text>
                </View>
              </View>

              <View style={styles.iconGrid}>
                {CATEGORY_ICON_OPTIONS.map(opt => {
                  const selected =
                    selectedIcon === opt.emoji && !keyboardEmoji.trim();
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.iconOption, selected && styles.iconOptionSelected]}
                      onPress={() => {
                        onSelectIcon(opt.emoji);
                        onKeyboardEmojiChange('');
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.iconEmoji}>{opt.emoji}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.sectionLabel, styles.sectionGap]}>CUSTOM EMOJI</Text>
              <TextInput
                style={styles.input}
                placeholder="Paste or type an emoji"
                placeholderTextColor={theme.colors.textSecondary}
                value={keyboardEmoji}
                onChangeText={onKeyboardEmojiChange}
                maxLength={8}
                autoCorrect={false}
                autoCapitalize="none"
              />

              <Text style={[styles.sectionLabel, styles.sectionGap]}>NOTES (OPTIONAL)</Text>
              <Text style={styles.hint}>One item per line · * or - for bullets</Text>
              <TextInput
                style={styles.notesInput}
                placeholder={'* Tata Motors\n* Gold ETF'}
                placeholderTextColor={theme.colors.textSecondary}
                value={description}
                onChangeText={onDescriptionChange}
                multiline
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.footer}>
              <Button
                mode="outlined"
                onPress={onDismiss}
                style={styles.footerBtn}
                textColor={theme.colors.onSurface}
              >
                Cancel
              </Button>
              <Button mode="contained" onPress={onAdd} style={styles.footerBtn}>
                Add category
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '88%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.surfaceVariant,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: H,
    paddingTop: 18,
    paddingBottom: 14,
  },
  titleBlock: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  closeHit: {
    padding: 2,
    marginTop: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.surfaceVariant,
    marginHorizontal: H,
  },
  scroll: {
    flexGrow: 0,
  },
  form: {
    paddingHorizontal: H,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  sectionGap: {
    marginTop: 18,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    marginTop: -4,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.onSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.surfaceVariant,
  },
  iconSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 8,
  },
  iconPreview: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.surfaceVariant,
  },
  iconPreviewEmoji: {
    fontSize: 22,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.surfaceVariant,
  },
  iconOptionSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: theme.colors.surface,
  },
  iconEmoji: {
    fontSize: 22,
  },
  notesInput: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 88,
    color: theme.colors.onSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.surfaceVariant,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: H,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.surfaceVariant,
  },
  footerBtn: {
    flex: 1,
    borderRadius: 8,
  },
});

export default AddCategoryModal;
