import React, { useState, useRef, useEffect } from 'react';

/**
 * MithraShoppy Shared SearchBar Component
 * Supports suggestions dropdown when suggestions prop is passed
 */
const SearchBar = ({
  placeholder = 'Search…',
  value,
  onChange,
  onSearch,
  suggestions = [],
  onSuggestionSelect,
  loading = false,
  className = '',
}) => {
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  const showDropdown = focused && suggestions.length > 0;

  // close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) onSearch(value);
  };

  return (
    <div ref={ref} className={`ms-searchbar ${focused ? 'ms-searchbar--focused' : ''} ${className}`}>
      <span className="ms-searchbar__icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </span>
      <input
        type="search"
        className="ms-searchbar__input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onKeyDown={handleKeyDown}
        aria-label={placeholder}
        autoComplete="off"
      />
      {loading && <span className="ms-searchbar__spinner" aria-hidden="true" />}
      {!loading && value && (
        <button
          className="ms-searchbar__clear"
          onClick={() => onChange({ target: { value: '' } })}
          aria-label="Clear search"
          type="button"
        >
          ×
        </button>
      )}
      {showDropdown && (
        <ul className="ms-searchbar__dropdown" role="listbox">
          {suggestions.map((s, i) => (
            <li
              key={i}
              role="option"
              className="ms-searchbar__suggestion"
              onMouseDown={() => {
                if (onSuggestionSelect) onSuggestionSelect(s);
                setFocused(false);
              }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
