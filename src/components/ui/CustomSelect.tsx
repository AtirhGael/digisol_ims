import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      dropdownRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
        } else if (highlightedIndex >= 0) {
          handleSelect(options[highlightedIndex].value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        }
        break;
    }
  };

  const baseClasses = `
    relative w-full max-w-full border border-gray-200 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 
    text-xs sm:text-sm text-gray-700 bg-white transition-all duration-200 box-border cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-300 hover:bg-gray-50 hover:shadow-sm'}
    ${isOpen ? 'border-indigo-400 ring-2 ring-indigo-300 shadow-sm' : ''}
    ${className}
  `;

  return (
    <div className="relative w-full group" ref={selectRef}>
      <div
        className={baseClasses}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center justify-between gap-2">
          <span className={`truncate ${selectedOption ? 'text-gray-700' : 'text-gray-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-all duration-200 ${
              isOpen ? 'rotate-180 text-indigo-500' : 'group-hover:text-gray-600'
            }`}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95 duration-200"
          role="listbox"
          tabIndex={-1}
          onKeyDown={handleKeyDown}
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              className={`
                px-2 sm:px-3 py-2 text-xs sm:text-sm cursor-pointer transition-all duration-150
                ${highlightedIndex === index ? 'bg-indigo-50 text-indigo-900 scale-[0.99]' : 'text-gray-700'}
                ${value === option.value ? 'bg-indigo-100 text-indigo-900 font-medium border-l-2 border-indigo-500' : ''}
                hover:bg-indigo-50 hover:text-indigo-900 hover:scale-[0.99] hover:shadow-sm
                active:bg-indigo-100 active:scale-[0.98]
              `}
              onClick={() => handleSelect(option.value)}
              onMouseEnter={() => setHighlightedIndex(index)}
              role="option"
              aria-selected={value === option.value}
            >
              {option.label}
            </div>
          ))}
          {options.length === 0 && (
            <div className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-400">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
};