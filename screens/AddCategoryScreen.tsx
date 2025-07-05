import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  IconButton,
  Divider,
} from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Category } from '../types/types';
import { categoryApi } from '../api/expenseApi';

type AddCategoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddCategory'>;

interface Props {
  navigation: AddCategoryScreenNavigationProp;
}

const AddCategoryScreen: React.FC<Props> = ({ navigation }) => {
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await categoryApi.getAll();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const validateCategoryName = (name: string): boolean => {
    if (!name.trim()) {
      setError('Category name is required');
      return false;
    }

    if (name.trim().length < 2) {
      setError('Category name must be at least 2 characters');
      return false;
    }

    if (name.trim().length > 50) {
      setError('Category name cannot exceed 50 characters');
      return false;
    }

    // Check if category already exists (case-insensitive)
    const existingCategory = categories.find(
      cat => cat.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (existingCategory) {
      setError('This category already exists');
      return false;
    }

    setError('');
    return true;
  };

  const handleAddCategory = async () => {
    if (!validateCategoryName(categoryName)) {
      return;
    }

    try {
      setLoading(true);
      const newCategory = await categoryApi.create(categoryName.trim());
      
      // Add to local state
      setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
      
      // Clear form
      setCategoryName('');
      setError('');

      Alert.alert(
        'Success',
        `Category "${newCategory.name}" added successfully!`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error creating category:', error);
      
      // Handle specific error messages from backend
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        Alert.alert('Error', 'Failed to add category. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoryApi.delete(categoryId);
              // Remove from local state
              setCategories(prev => prev.filter(cat => cat._id !== categoryId));
              Alert.alert('Success', 'Category deleted successfully!');
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <Card style={styles.categoryCard} mode="outlined">
      <Card.Content>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <IconButton
            icon="delete"
            size={20}
            onPress={() => handleDeleteCategory(item._id, item.name)}
            style={styles.deleteButton}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const handleInputChange = (text: string) => {
    setCategoryName(text);
    if (error) {
      setError('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Add Category Form */}
      <Card style={styles.formCard} mode="outlined">
        <Card.Content>
          <Text style={styles.title}>Add New Category</Text>
          
          <TextInput
            label="Category Name"
            value={categoryName}
            onChangeText={handleInputChange}
            mode="outlined"
            placeholder="e.g. Groceries, Gas, Entertainment"
            error={!!error}
            style={styles.input}
            maxLength={50}
          />
          
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleAddCategory}
            loading={loading}
            disabled={loading || !categoryName.trim()}
            style={styles.addButton}
            labelStyle={styles.addButtonText}
          >
            {loading ? 'Adding...' : 'Add Category'}
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            disabled={loading}
          >
            Back
          </Button>
        </Card.Content>
      </Card>

      <Divider style={styles.divider} />

      {/* Existing Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>
          Existing Categories ({categories.length})
        </Text>
        
        {categories.length === 0 ? (
          <Card style={styles.emptyCard} mode="outlined">
            <Card.Content>
              <Text style={styles.emptyText}>No categories yet</Text>
              <Text style={styles.emptySubtext}>
                Add your first category above to get started
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formCard: {
    margin: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 4,
  },
  addButton: {
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#6200ee',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginBottom: 8,
  },
  divider: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  categoriesSection: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoryCard: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  deleteButton: {
    margin: 0,
  },
  emptyCard: {
    backgroundColor: '#fff',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default AddCategoryScreen;
