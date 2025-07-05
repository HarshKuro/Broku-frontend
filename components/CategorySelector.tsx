import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Button, Chip } from 'react-native-paper';
import { Category } from '../types/types';
import { categoryApi } from '../api/expenseApi';

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

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    marginRight: -8,
  },
  addButtonLabel: {
    fontSize: 12,
    color: '#6200ee',
  },
  scrollView: {
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedChip: {
    backgroundColor: '#6200ee',
  },
  chipText: {
    color: '#333',
  },
  selectedChipText: {
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  emptyButton: {
    marginTop: 8,
  },
});

export default CategorySelector;
