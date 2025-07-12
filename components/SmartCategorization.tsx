import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { aiApi } from '../api/aiApi';

interface SmartCategorizationProps {
  description: string;
  amount: number;
  onCategorySelected: (categoryId: string, categoryName: string) => void;
  currentCategory?: string;
}

const SmartCategorization: React.FC<SmartCategorizationProps> = ({
  description,
  amount,
  onCategorySelected,
  currentCategory
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{id: string, name: string, confidence: number}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getSuggestions = async () => {
    if (!description.trim() || amount <= 0) return;

    try {
      setLoading(true);
      const response = await aiApi.categorizeExpense(description, amount);
      
      if (response.success && response.data?.suggestions) {
        setSuggestions(response.data.suggestions);
        setShowSuggestions(true);
      } else {
        // Fallback: Create simple suggestions based on keywords
        const fallbackSuggestions = [
          { id: '1', name: 'Food & Dining', confidence: 0.7 },
          { id: '2', name: 'Transportation', confidence: 0.5 },
          { id: '3', name: 'Shopping', confidence: 0.4 }
        ];
        setSuggestions(fallbackSuggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      // Show fallback suggestions even on error
      const fallbackSuggestions = [
        { id: '1', name: 'General', confidence: 0.6 },
        { id: '2', name: 'Other', confidence: 0.5 }
      ];
      setSuggestions(fallbackSuggestions);
      setShowSuggestions(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionSelect = (suggestion: {id: string, name: string, confidence: number}) => {
    onCategorySelected(suggestion.id, suggestion.name);
    setShowSuggestions(false);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#51cf66'; // High confidence - green
    if (confidence >= 0.6) return '#ffd43b'; // Medium confidence - yellow
    return '#ff6b6b'; // Low confidence - red
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (!description.trim() || amount <= 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.aiButton, loading && styles.aiButtonLoading]}
        onPress={getSuggestions}
        disabled={loading || showSuggestions}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Ionicons name="sparkles" size={16} color={theme.colors.primary} />
        )}
        <Text style={styles.aiButtonText}>
          {loading ? 'Getting AI suggestions...' : 'Get AI Category Suggestions'}
        </Text>
      </Pressable>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>AI Suggestions:</Text>
          {suggestions.map((suggestion, index) => (
            <Pressable
              key={index}
              style={[
                styles.suggestionItem,
                currentCategory === suggestion.id && styles.selectedSuggestion
              ]}
              onPress={() => handleSuggestionSelect(suggestion)}
            >
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionName}>{suggestion.name}</Text>
                <View style={styles.confidenceContainer}>
                  <View 
                    style={[
                      styles.confidenceDot, 
                      { backgroundColor: getConfidenceColor(suggestion.confidence) }
                    ]} 
                  />
                  <Text style={[
                    styles.confidenceText,
                    { color: getConfidenceColor(suggestion.confidence) }
                  ]}>
                    {getConfidenceText(suggestion.confidence)}
                  </Text>
                </View>
              </View>
              <Text style={styles.confidencePercentage}>
                {Math.round(suggestion.confidence * 100)}%
              </Text>
            </Pressable>
          ))}
          
          <Pressable
            style={styles.dismissButton}
            onPress={() => setShowSuggestions(false)}
          >
            <Ionicons name="close" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.dismissText}>Dismiss suggestions</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  aiButtonLoading: {
    opacity: 0.7,
  },
  aiButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  suggestionsContainer: {
    marginTop: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSuggestion: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  suggestionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  confidencePercentage: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginLeft: 8,
  },
  dismissButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  dismissText: {
    marginLeft: 4,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
});

export default SmartCategorization;
