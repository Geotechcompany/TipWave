import React from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeSwitcher = ({ currentTheme, onThemeChange }) => {
  return (
    <button
      onClick={() => onThemeChange(currentTheme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
    >
      {currentTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default ThemeSwitcher;