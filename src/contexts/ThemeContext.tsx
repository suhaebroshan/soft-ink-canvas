import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbService } from '@/lib/db';

interface ThemeContextType {
  glassTheme: boolean;
  toggleGlassTheme: () => void;
  backgroundEnabled: boolean;
  toggleBackground: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [glassTheme, setGlassTheme] = useState(false);
  const [backgroundEnabled, setBackgroundEnabled] = useState(false);

  // Load theme settings
  useEffect(() => {
    const loadSettings = async () => {
      const glass = await dbService.getSetting('glassTheme');
      const bg = await dbService.getSetting('backgroundEnabled');
      setGlassTheme(glass === 'true');
      setBackgroundEnabled(bg === 'true');
    };
    loadSettings();
  }, []);

  const toggleGlassTheme = async () => {
    const newValue = !glassTheme;
    setGlassTheme(newValue);
    await dbService.setSetting('glassTheme', String(newValue));
  };

  const toggleBackground = async () => {
    const newValue = !backgroundEnabled;
    setBackgroundEnabled(newValue);
    await dbService.setSetting('backgroundEnabled', String(newValue));
  };

  return (
    <ThemeContext.Provider value={{ glassTheme, toggleGlassTheme, backgroundEnabled, toggleBackground }}>
      <div className={glassTheme ? 'glass-theme' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
