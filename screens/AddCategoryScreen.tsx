import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  TextInput,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Category } from '../types/types';
import { offlineCategoryApi as categoryApi } from '../services/offlineApi';
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
    <View style={styles.categoryCard}>
      <View style={styles.categoryRow}>
        <View style={styles.categoryIconContainer}>
          <Ionicons name="pricetag" size={20} color={colors.primary} />
        </View>
        <Text style={[styles.categoryName, { color: colors.text.primary }]}>{item.name}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCategory(item._id, item.name)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
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
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    formCard: {
      marginHorizontal: 16,
      marginTop: 16,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    input: {
      backgroundColor: colors.surface,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 12,
      marginBottom: 16,
      marginLeft: 4,
    },
    addButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    categoriesSection: {
      flex: 1,
      marginHorizontal: 16,
      marginTop: 24,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    categoryCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary + '20', // Adding transparency
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    categoryName: {
      fontSize: 16,
      fontWeight: '500',
      flex: 1,
    },
    deleteButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 32,
      alignItems: 'center',
      marginTop: 20,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    listContent: {
      paddingBottom: 20,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Categories</Text>
        <View style={styles.closeButton} />
      </View>

      {/* Add Category Form */}
      <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Add New Category</Text>
        
        <TextInput
          label="Category Name"
          value={categoryName}
          onChangeText={handleInputChange}
          mode="outlined"
          placeholder="e.g. Groceries, Gas, Entertainment"
          error={!!error}
          style={[styles.input, { backgroundColor: colors.surface }]}
          maxLength={50}
        />
        
        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: loading || !categoryName.trim() ? colors.text.disabled : colors.primary }
          ]}
          onPress={handleAddCategory}
          disabled={loading || !categoryName.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>
            {loading ? 'Adding...' : 'Add Category'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Existing Categories */}
      <View style={styles.categoriesSection}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
          Existing Categories ({categories.length})
        </Text>
        
        {categories.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>No categories yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.text.disabled }]}>
              Add your first category above to get started
            </Text>
          </View>
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
    </SafeAreaView>
    </View>
  );
};

export default AddCategoryScreen;
