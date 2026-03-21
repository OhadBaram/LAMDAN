import React, { useState, useEffect } from 'react';
import { Sun, Moon, Contrast, Eye, Palette, Check, ChevronDown } from 'lucide-react';

type Theme = 'light' | 'dark' | 'high-contrast' | 'low-contrast';
type ColorScheme = 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal';

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface ColorSchemeOption {
  value: ColorScheme;
  name: string;
  gradient: string;
  colors: string[];
}

export function ThemeSelector() {
  const [theme, setTheme] = useState<Theme>('light');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('blue');
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions: ThemeOption[] = [
    {
      value: 'light',
      label: 'מצב בהיר',
      icon: <Sun className="w-4 h-4" />,
      description: 'עיצוב בהיר ונקי'
    },
    {
      value: 'dark',
      label: 'מצב כהה',
      icon: <Moon className="w-4 h-4" />,
      description: 'עיצוב כהה אלגנטי'
    },
    {
      value: 'high-contrast',
      label: 'קונטרסט גבוה',
      icon: <Contrast className="w-4 h-4" />,
      description: 'נגישות מירבית'
    },
    {
      value: 'low-contrast',
      label: 'קונטרסט נמוך',
      icon: <Eye className="w-4 h-4" />,
      description: 'מראה רך ונעים'
    }
  ];

  const colorSchemes: ColorSchemeOption[] = [
    {
      value: 'blue',
      name: 'כחול',
      gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      colors: ['#3b82f6', '#1d4ed8', '#60a5fa', '#dbeafe']
    },
    {
      value: 'purple',
      name: 'סגול',
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      colors: ['#8b5cf6', '#7c3aed', '#a78bfa', '#ede9fe']
    },
    {
      value: 'green',
      name: 'ירוק',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      colors: ['#10b981', '#059669', '#34d399', '#d1fae5']
    },
    {
      value: 'orange',
      name: 'כתום',
      gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
      colors: ['#f97316', '#ea580c', '#fb923c', '#fed7aa']
    },
    {
      value: 'pink',
      name: 'ורוד',
      gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
      colors: ['#ec4899', '#db2777', '#f472b6', '#fce7f3']
    },
    {
      value: 'teal',
      name: 'טורקיז',
      gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)',
      colors: ['#14b8a6', '#0d9488', '#2dd4bf', '#ccfbf1']
    }
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedColorScheme = localStorage.getItem('colorScheme') as ColorScheme;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    if (savedColorScheme) {
      setColorScheme(savedColorScheme);
      applyColorScheme(savedColorScheme);
    }
  }, []);

  const applyColorScheme = (scheme: ColorScheme) => {
    const root = document.documentElement;
    const colors = colorSchemes.find(c => c.value === scheme)?.colors || colorSchemes[0].colors;
    
    root.style.setProperty('--accent', colors[0]);
    root.style.setProperty('--accent-hover', colors[1]);
    root.style.setProperty('--accent-light', colors[3]);
    root.style.setProperty('--gradient-accent', colorSchemes.find(c => c.value === scheme)?.gradient || '');
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleColorSchemeChange = (newScheme: ColorScheme) => {
    setColorScheme(newScheme);
    applyColorScheme(newScheme);
    localStorage.setItem('colorScheme', newScheme);
  };

  const currentTheme = themeOptions.find(t => t.value === theme);
  const currentColorScheme = colorSchemes.find(c => c.value === colorScheme);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
        style={{
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <Palette className="w-4 h-4" style={{ color: 'var(--accent)' }} />
        <span className="hidden sm:inline">עיצוב</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 rounded-2xl shadow-2xl border overflow-hidden z-50 fade-in"
          style={{
            background: 'var(--bg-primary)',
            borderColor: 'var(--border)'
          }}
        >
          {/* Theme Selection */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              מצב תצוגה
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-200 ${
                    theme === option.value 
                      ? 'ring-2' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    background: theme === option.value ? 'var(--accent-light)' : 'var(--bg-secondary)',
                    color: theme === option.value ? 'var(--accent)' : 'var(--text-primary)',
                    ringColor: theme === option.value ? 'var(--accent)' : 'transparent'
                  }}
                >
                  {option.icon}
                  <div className="text-right">
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs opacity-70">{option.description}</div>
                  </div>
                  {theme === option.value && (
                    <Check className="w-4 h-4 mr-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Color Scheme Selection */}
          <div className="p-4">
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              חבילת צבעים
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {colorSchemes.map((scheme) => (
                <button
                  key={scheme.value}
                  onClick={() => handleColorSchemeChange(scheme.value)}
                  className={`relative p-3 rounded-xl transition-all duration-200 ${
                    colorScheme === scheme.value 
                      ? 'ring-2 scale-105' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    background: scheme.gradient,
                    ringColor: colorScheme === scheme.value ? 'var(--accent)' : 'transparent'
                  }}
                >
                  <div className="w-full h-8 rounded-lg mb-2 opacity-20 bg-white"></div>
                  <div className="text-white text-xs font-medium drop-shadow-lg">
                    {scheme.name}
                  </div>
                  {colorScheme === scheme.value && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3" style={{ color: scheme.colors[0] }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
