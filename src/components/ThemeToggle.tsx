import React, { useState, useEffect } from 'react';
import { Sun, Moon, Contrast, Eye } from 'lucide-react';

type Theme = 'light' | 'dark' | 'high-contrast' | 'low-contrast';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'high-contrast', 'low-contrast'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5" />;
      case 'dark':
        return <Moon className="w-5 h-5" />;
      case 'high-contrast':
        return <Contrast className="w-5 h-5" />;
      case 'low-contrast':
        return <Eye className="w-5 h-5" />;
      default:
        return <Sun className="w-5 h-5" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'high-contrast':
        return 'High Contrast';
      case 'low-contrast':
        return 'Low Contrast';
      default:
        return 'Light Mode';
    }
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={getThemeLabel()}
      aria-label={getThemeLabel()}
    >
      {getThemeIcon()}
    </button>
  );
}
