import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

const ThemeSwitcher: React.FC = () => {
  const { themeSetting, setThemeSetting, effectiveTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { value: 'light', label: 'Claro', icon: 'sun' as const },
    { value: 'dark', label: 'Escuro', icon: 'moon' as const },
    { value: 'system', label: 'Sistema', icon: 'desktop' as const },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(p => !p)}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200"
        aria-label="Alternar tema"
      >
        {effectiveTheme === 'dark' ? <Icon type="moon" className="h-6 w-6" /> : <Icon type="sun" className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-2xl z-20 py-1">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => {
                setThemeSetting(option.value as any);
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 w-full text-left px-3 py-2 text-sm transition-colors ${
                themeSetting === option.value
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon type={option.icon} className="h-5 w-5" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;