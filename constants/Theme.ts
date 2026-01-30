import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Theme = {
  colors: {
    primary: '#6366f1', // Indigo
    secondary: '#ec4899', // Pink
    accent: '#10b981', // Emerald
    background: '#0f172a', // Slate 900
    card: '#1e293b', // Slate 800
    text: '#f8fafc', // Slate 50
    textMuted: '#94a3b8', // Slate 400
    error: '#ef4444', // Red 500
    success: '#22c55e', // Green 500
    warning: '#f59e0b', // Amber 500

    gradients: {
      primary: ['#6366f1', '#a855f7'] as const,
      secondary: ['#ec4899', '#f43f5e'] as const,
      success: ['#22c55e', '#10b981'] as const,
      background: ['#0f172a', '#1e293b'] as const,
      glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'] as const,
    }
  },

  fonts: {
    regular: 'System', // Fallback to System, but we can use FredokaOne/Outfit if loaded
    bold: 'System',
    heading: 'System',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  layout: {
    width,
    height,
    borderRadius: 16,
    cardPadding: 20,
  },

  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)', // For web/ios support where applicable
  },

  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  }
};
