import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { theme, getThemeColors, ColorScheme } from './theme';

interface ThemeContextType {
  colorScheme: ColorScheme;
  colors: typeof theme.colors.light;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultScheme?: ColorScheme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultScheme 
}) => {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    defaultScheme || systemColorScheme || 'light'
  );

  // Update theme when system color scheme changes (optional)
  useEffect(() => {
    if (!defaultScheme && systemColorScheme) {
      setColorScheme(systemColorScheme);
    }
  }, [systemColorScheme, defaultScheme]);

  const colors = getThemeColors(colorScheme);
  const isDark = colorScheme === 'dark';

  const toggleTheme = () => {
    setColorScheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (scheme: ColorScheme) => {
    setColorScheme(scheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        colors,
        isDark,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useThemedStyles = () => {
  const { colorScheme } = useTheme();
  
  return {
    colors: getThemeColors(colorScheme),
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    typography: theme.typography,
    shadows: theme.shadows,
  };
};
