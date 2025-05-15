import { useState, useEffect } from 'react';

const ThemeIndicator = () => {
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  
  // Update the indicator when theme changes
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };
    
    // Check initially and then every second
    checkTheme();
    const interval = setInterval(checkTheme, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed bottom-4 right-4 p-2 bg-gray-200 dark:bg-gray-700 rounded shadow-md z-50">
      <span className="text-sm text-gray-900 dark:text-white">
        Theme: {isDarkMode ? '🌙 Dark' : '☀️ Light'}
      </span>
    </div>
  );
};

export default ThemeIndicator; 