import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types/types';
import { offlineCategoryApi as categoryApi } from '../services/offlineApi';
import { useTheme } from '../constants/ThemeProvider';

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
  const { colors } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Update search text when selected category changes
    if (selectedCategory) {
      setSearchText(selectedCategory);
      setShowSuggestions(false);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const fetchedCategories = await categoryApi.getAll();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories for demo
      setCategories([
        { _id: '1', name: 'Food & Dining', createdAt: '', updatedAt: '' },
        { _id: '2', name: 'Transportation', createdAt: '', updatedAt: '' },
        { _id: '3', name: 'Shopping', createdAt: '', updatedAt: '' },
        { _id: '4', name: 'Entertainment', createdAt: '', updatedAt: '' },
        { _id: '5', name: 'Bills & Utilities', createdAt: '', updatedAt: '' },
        { _id: '6', name: 'Healthcare', createdAt: '', updatedAt: '' },
        { _id: '7', name: 'Groceries', createdAt: '', updatedAt: '' },
        { _id: '8', name: 'Gas & Fuel', createdAt: '', updatedAt: '' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setShowSuggestions(text.length > 0);
    
    // If user clears the search, clear the selection
    if (text === '') {
      onCategorySelect('');
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    setSearchText(categoryName);
    onCategorySelect(categoryName);
    setShowSuggestions(false);
  };

  const handleSearchFocus = () => {
    if (searchText.length > 0) {
      setShowSuggestions(true);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
      zIndex: 1000,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border || '#E5E7EB',
      borderRadius: 8,
      backgroundColor: colors.surface || '#FFFFFF',
      paddingHorizontal: 12,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 12,
      color: colors.text?.primary || '#000',
    },
    clearButton: {
      padding: 4,
    },
    suggestions: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: colors.surface || '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border || '#E5E7EB',
      borderRadius: 8,
      marginTop: 4,
      maxHeight: 200,
      zIndex: 1001,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight || '#F3F4F6',
    },
    lastSuggestionItem: {
      borderBottomWidth: 0,
    },
    suggestionIcon: {
      marginRight: 12,
      width: 20,
      alignItems: 'center',
    },
    suggestionText: {
      fontSize: 16,
      color: colors.text?.primary || '#000',
    },
    addCategoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.primaryLight || '#EEF2FF',
      borderTopWidth: 1,
      borderTopColor: colors.border || '#E5E7EB',
    },
    addCategoryIcon: {
      marginRight: 12,
      width: 20,
      alignItems: 'center',
    },
    addCategoryText: {
      fontSize: 16,
      color: colors.primary || '#4C7EFF',
      fontWeight: '600',
    },
    noResultsContainer: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    noResultsText: {
      fontSize: 14,
      color: colors.text?.secondary || '#6B7280',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.text?.secondary || '#6B7280'}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={handleSearchChange}
          onFocus={handleSearchFocus}
          placeholder="Search or type category name"
          placeholderTextColor={colors.text?.disabled || '#9CA3AF'}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchText('');
              onCategorySelect('');
              setShowSuggestions(false);
            }}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.text?.secondary || '#6B7280'}
            />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && (
        <View style={styles.suggestions}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {filteredCategories.length > 0 ? (
              <>
                {filteredCategories.map((category, index) => (
                  <TouchableOpacity
                    key={category._id}
                    style={[
                      styles.suggestionItem,
                      index === filteredCategories.length - 1 && styles.lastSuggestionItem
                    ]}
                    onPress={() => handleCategorySelect(category.name)}
                  >
                    <View style={styles.suggestionIcon}>
                      <Ionicons
                        name="pricetag"
                        size={16}
                        color={colors.text?.secondary || '#6B7280'}
                      />
                    </View>
                    <Text style={styles.suggestionText}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.addCategoryButton}
                  onPress={() => {
                    setShowSuggestions(false);
                    onAddCategory();
                  }}
                >
                  <View style={styles.addCategoryIcon}>
                    <Ionicons
                      name="add"
                      size={16}
                      color={colors.primary || '#4C7EFF'}
                    />
                  </View>
                  <Text style={styles.addCategoryText}>Add new category</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>
                    No matching categories found
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.addCategoryButton}
                  onPress={() => {
                    setShowSuggestions(false);
                    onAddCategory();
                  }}
                >
                  <View style={styles.addCategoryIcon}>
                    <Ionicons
                      name="add"
                      size={16}
                      color={colors.primary || '#4C7EFF'}
                    />
                  </View>
                  <Text style={styles.addCategoryText}>Create "{searchText}" category</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default CategorySelector;
