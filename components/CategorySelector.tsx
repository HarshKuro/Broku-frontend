import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Button, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types/types';
import { offlineCategoryApi as categoryApi } from '../services/offlineApi';
import { useTheme } from '../constants/ThemeProvider';
import { theme } from '../constants/theme';

interface CategorySelectorProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  onAddCategory: () => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategorySelect,
  onAddCategory,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const fetchedCategories = await categoryApi.getAll();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = () => {
    fetchCategories();
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Category</Text>
        <Button
          mode="text"
          onPress={onAddCategory}
          style={styles.addButton}
          labelStyle={styles.addButtonLabel}
        >
          + Add New
        </Button>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <Chip
            key={category._id}
            selected={selectedCategory === category.name}
            onPress={() => onCategorySelect(category.name)}
            style={[
              styles.chip,
              selectedCategory === category.name && styles.selectedChip,
            ]}
            textStyle={[
              styles.chipText,
              selectedCategory === category.name && styles.selectedChipText,
            ]}
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>

      {categories.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No categories found</Text>
          <Button mode="contained" onPress={onAddCategory} style={styles.emptyButton}>
            Add Your First Category
          </Button>
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginVertical: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  addButton: {
    marginRight: -8,
  },
  addButtonLabel: {
    fontSize: 12,
    color: colors.primary,
  },
  scrollView: {
    marginBottom: theme.spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 4,
  },
  chip: {
    marginRight: theme.spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.level1,
  },
  selectedChip: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.text.primary,
  },
  selectedChipText: {
    color: colors.surface,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  emptyButton: {
    marginTop: theme.spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.md,
  },
});

export default CategorySelector;
