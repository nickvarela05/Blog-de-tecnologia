import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange, placeholder = "Selecione...", className = '', disabled = false, error = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(p => !p)}
        disabled={disabled}
        className={`w-full flex items-center justify-between p-2 text-left bg-gray-50 dark:bg-slate-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
        } ${disabled ? 'bg-gray-200 dark:bg-slate-800 text-gray-500 cursor-not-allowed' : 'text-gray-900 dark:text-white'}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <Icon type="chevron-down" className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
          <ul role="listbox">
            {options.map(option => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  value === option.value
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
                role="option"
                aria-selected={value === option.value}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;