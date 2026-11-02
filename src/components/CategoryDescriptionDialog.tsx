import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Dialog, Portal, Text, Button, IconButton } from 'react-native-paper';
import { theme } from '../theme';
import { parseCategoryDescriptionLines } from '../utils/categoryDescription';

interface CategoryDescriptionDialogProps {
  visible: boolean;
  categoryName: string;
  description: string;
  onDismiss: () => void;
}

const CategoryDescriptionDialog: React.FC<CategoryDescriptionDialogProps> = ({
  visible,
  categoryName,
  description,
  onDismiss,
}) => {
  const lines = parseCategoryDescriptionLines(description);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <View style={styles.titleRow}>
          <Dialog.Title style={styles.title}>{categoryName}</Dialog.Title>
          <IconButton icon="close" size={20} onPress={onDismiss} iconColor={theme.colors.textSecondary} />
        </View>
        <Dialog.Content style={styles.content}>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {lines.map((line, index) => (
              <View key={`${index}-${line}`} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.lineText}>{line}</Text>
              </View>
            ))}
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: theme.colors.surface,
    maxHeight: '70%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  title: {
    flex: 1,
    marginBottom: 0,
  },
  content: {
    paddingTop: 0,
  },
  scroll: {
    maxHeight: 280,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bullet: {
    color: theme.colors.primary,
    fontSize: 16,
    lineHeight: 22,
    marginRight: 8,
    width: 12,
  },
  lineText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.onSurface,
  },
});

export default CategoryDescriptionDialog;
