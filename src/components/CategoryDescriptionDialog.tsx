import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onDismiss} accessibilityRole="button" />

        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={styles.title} numberOfLines={2}>
                {categoryName}
              </Text>
              <Text style={styles.subtitle}>
                {lines.length} {lines.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onDismiss}
              style={styles.closeHit}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Close"
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
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            bounces={lines.length > 6}
          >
            {lines.map((line, index) => (
              <View key={`${index}-${line}`} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.lineText}>{line}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    maxHeight: '55%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.surfaceVariant,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
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
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  closeHit: {
    padding: 2,
    marginTop: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.surfaceVariant,
    marginHorizontal: 20,
  },
  scroll: {
    flexGrow: 0,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.primary,
    marginRight: 12,
    marginTop: 8,
  },
  lineText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.onSurface,
  },
});

export default CategoryDescriptionDialog;
