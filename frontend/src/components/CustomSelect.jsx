import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, placeholder, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Sync state when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(value || '');
    }
  }, [isOpen, value]);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Input / Bouton déclencheur */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary-400 z-10">
          {icon}
        </div>
        <input
          type="text"
          value={isOpen ? searchTerm : (value || '')}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (e.target.value === '') {
               onChange('');
            }
          }}
          onClick={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-slate-50/80 hover:bg-white border-0 rounded-xl focus:ring-2 focus:ring-primary-500 pl-12 pr-10 py-3.5 text-slate-900 font-medium transition-all shadow-sm outline-none"
        />
        <div 
          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-primary-500 z-10"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-500' : ''}`} />
        </div>
      </div>

      {/* Liste déroulante */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-md border border-slate-100 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-fade-in custom-scrollbar">
          <ul className="py-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={index}
                  onClick={() => {
                    onChange(option);
                    setSearchTerm(option);
                    setIsOpen(false);
                  }}
                  className={`px-5 py-3 cursor-pointer transition-colors text-sm font-medium ${
                    value === option 
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-primary-600'
                  }`}
                >
                  {option}
                </li>
              ))
            ) : (
              <li className="px-5 py-3 text-sm text-slate-500 italic text-center">Aucun résultat trouvé</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
