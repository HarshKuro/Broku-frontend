// Perfect Dual Color Theme (Light + Dark)
const lightColors = {
  primary: '#4C7EFF', // Fresh blue (trust + tech)
  primaryDark: '#3B66E8',
  primaryLight: '#6B8AFF',
  accent: '#FFA657', // Orange highlight (for ₹, pie)
  accentLight: '#FFB875',
  accentDark: '#FF9339',
  background: '#F9FAFC', // Very light grayish white
  surface: '#FFFFFF', // Clean, white cards
  surfaceVariant: '#F3F4F6', // Slightly grayed surface
  onSurface: '#1E1E1E', // Near-black for readability
  onSurfaceVariant: '#6B7280', // Soft gray (for dates, etc.)
  error: '#EF4444', // Red 500
  errorLight: '#FEE2E2', // Red 50
  success: '#10B981', // Emerald 500
  successLight: '#D1FAE5', // Emerald 50
  warning: '#F59E0B', // Amber 500
  warningLight: '#FEF3C7', // Amber 50
  text: {
    primary: '#1E1E1E', // Near-black for readability
    secondary: '#6B7280', // Soft gray (for dates, etc.)
    disabled: '#9CA3AF', // Light gray for disabled
  },
  border: '#E5E7EB', // Soft stroke lines
  borderLight: '#F3F4F6', // Very light border
  shadow: 'rgba(30, 30, 30, 0.08)', // Dark shadow with opacity
};

const darkColors = {
  primary: '#4C7EFF', // Keep the blue for contrast
  primaryDark: '#3B66E8',
  primaryLight: '#6B8AFF',
  accent: '#FFA657', // Same orange pop
  accentLight: '#FFB875',
  accentDark: '#FF9339',
  background: '#121212', // Jet black base
  surface: '#1F1F1F', // Slightly lighter for cards
  surfaceVariant: '#2A2A2E', // Card variant in dark
  onSurface: '#F2F2F2', // Light gray/white for text
  onSurfaceVariant: '#A1A1AA', // Dim gray for secondary text
  error: '#EF4444', // Red 500
  errorLight: '#7F1D1D', // Dark red for error backgrounds
  success: '#10B981', // Emerald 500
  successLight: '#064E3B', // Dark green for success backgrounds
  warning: '#F59E0B', // Amber 500
  warningLight: '#78350F', // Dark amber for warning backgrounds
  text: {
    primary: '#F2F2F2', // Light gray/white for text
    secondary: '#A1A1AA', // Dim gray for secondary text
    disabled: '#6B7280', // Darker gray for disabled
  },
  border: '#2A2A2E', // Soft border contrast
  borderLight: '#1F1F1F', // Very dark border
  shadow: 'rgba(0, 0, 0, 0.25)', // Black shadow with opacity
};

export const theme = {
  colors: {
    light: lightColors,
    dark: darkColors,
    // Default to light mode colors for backward compatibility
    ...lightColors,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    overline: {
      fontSize: 10,
      fontWeight: '500' as const,
      lineHeight: 16,
      letterSpacing: 1.5,
    },
  },
  shadows: {
    level0: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    level1: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    level2: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    level3: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    level4: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    level5: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export type Theme = typeof theme;
export type ColorScheme = 'light' | 'dark';

// Utility function to get theme colors based on color scheme
export const getThemeColors = (colorScheme: ColorScheme = 'light') => {
  return colorScheme === 'dark' ? theme.colors.dark : theme.colors.light;
};

// Hook-like function to create themed styles
export const createThemedStyles = (colorScheme: ColorScheme = 'light') => {
  const colors = getThemeColors(colorScheme);
  
  return {
    colors,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    typography: theme.typography,
    shadows: theme.shadows,
  };
};