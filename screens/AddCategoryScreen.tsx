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
import { useTheme, useThemedStyles } from '../constants/ThemeProvider';

type AddCategoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddCategory'>;

interface Props {
  navigation: AddCategoryScreenNavigationProp;
}

const AddCategoryScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const themedStyles = useThemedStyles();
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

  // Create styles inside component to access theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    formCard: {
      margin: themedStyles.spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: themedStyles.borderRadius.lg,
      ...themedStyles.shadows.level2,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: themedStyles.spacing.xl,
      textAlign: 'center',
    },
    input: {
      backgroundColor: colors.surface,
      marginBottom: themedStyles.spacing.sm,
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginBottom: themedStyles.spacing.lg,
      marginLeft: 4,
    },
    addButton: {
      marginBottom: themedStyles.spacing.md,
      paddingVertical: themedStyles.spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: themedStyles.borderRadius.md,
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButton: {
      marginBottom: themedStyles.spacing.sm,
    },
    divider: {
      marginHorizontal: themedStyles.spacing.lg,
      marginVertical: themedStyles.spacing.sm,
    },
    categoriesSection: {
      flex: 1,
      marginHorizontal: themedStyles.spacing.lg,
      marginBottom: themedStyles.spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: themedStyles.spacing.md,
    },
    categoryCard: {
      marginBottom: themedStyles.spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: themedStyles.borderRadius.md,
      ...themedStyles.shadows.level1,
    },
    categoryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    categoryName: {
      fontSize: 16,
      color: colors.text.primary,
      flex: 1,
    },
    deleteButton: {
      margin: 0,
    },
    emptyCard: {
      backgroundColor: colors.surface,
      marginTop: themedStyles.spacing.xl,
      borderRadius: themedStyles.borderRadius.md,
      ...themedStyles.shadows.level1,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: themedStyles.spacing.sm,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.text.disabled,
      textAlign: 'center',
    },
    listContent: {
      paddingBottom: themedStyles.spacing.xl,
    },
  });

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

export default AddCategoryScreen;
