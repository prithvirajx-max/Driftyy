import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Top country codes with their flags and codes
export const popularCountryCodes = [
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
  { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: '+7', country: 'RU', flag: '🇷🇺', name: 'Russia' },
  { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil' },
  { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
  { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy' },
  { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain' },
  { code: '+1', country: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: '+52', country: 'MX', flag: '🇲🇽', name: 'Mexico' },
];

interface CountryCodeSelectorProps {
  selectedCode: string;
  onSelect: (code: string) => void;
  className?: string;
}

const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  selectedCode,
  onSelect,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(() => {
    return popularCountryCodes.find(c => c.code === selectedCode) || popularCountryCodes[0];
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update the selected country when the selected code changes from outside
  useEffect(() => {
    const country = popularCountryCodes.find(c => c.code === selectedCode);
    if (country) {
      setSelectedCountry(country);
    }
  }, [selectedCode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (country: typeof popularCountryCodes[0]) => {
    setSelectedCountry(country);
    onSelect(country.code);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        className="px-3 py-2 rounded-lg bg-white/30 border border-white/40 flex items-center gap-1 hover:bg-white/40 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedCountry.flag}</span>
        <span>{selectedCountry.code}</span>
        <span className="ml-1">▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 top-full left-0 mt-1 w-56 max-h-72 overflow-y-auto bg-white/90 backdrop-blur-lg border border-white/40 rounded-lg shadow-xl"
          >
            <div className="p-2">
              {popularCountryCodes.map((country) => (
                <div
                  key={`${country.code}-${country.country}`}
                  className="flex items-center gap-2 p-2 hover:bg-pink-100/50 rounded cursor-pointer"
                  onClick={() => handleSelect(country)}
                >
                  <span className="text-xl">{country.flag}</span>
                  <span className="font-medium">{country.name}</span>
                  <span className="text-gray-500 ml-auto">{country.code}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CountryCodeSelector;
