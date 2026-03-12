import React, { useState, useRef, useEffect } from 'react';
import './CountrySelector.css';

export interface CountryInfo {
  id: string;
  name: string;
  flag: string;
  coords: [number, number];
  zoom: number;
}

const COUNTRIES: CountryInfo[] = [
  { id: 'es', name: 'España', flag: '🇪🇸', coords: [40.4168, -3.7038], zoom: 6 },
  { id: 'da', name: 'Danmark', flag: '🇩🇰', coords: [55.6761, 12.5683], zoom: 7 },
  { id: 'is', name: 'Ísland', flag: '🇮🇸', coords: [64.1265, -21.8174], zoom: 6 },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', coords: [51.5074, -0.1278], zoom: 6 },
];

interface CountrySelectorProps {
  onSelect: (country: CountryInfo) => void;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountryClick = (country: CountryInfo) => {
    onSelect(country);
    setIsOpen(false);
  };

  return (
    <div className="country-selector" ref={menuRef}>
      <button 
        className="country-selector__trigger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select country"
        title="Select country"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      </button>

      {isOpen && (
        <div className="country-selector__menu">
          {COUNTRIES.map((country) => (
            <button
              key={country.id}
              className="country-selector__item"
              onClick={() => handleCountryClick(country)}
            >
              <span className="country-selector__flag">{country.flag}</span>
              <span className="country-selector__name">{country.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountrySelector;
