import React from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';

/**
 * Select — themed dropdown.
 * Uses theme tokens so it adapts to dark/light mode automatically.
 */
export default function Select({ label, id, options, className = '', ...props }) {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="mb-2 text-sm text-aura-text-muted font-sans font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className="
            w-full bg-aura-surface border border-aura-border rounded-lg px-4 py-3
            text-aura-text text-sm appearance-none
            focus:outline-none focus:border-aura-accent focus:ring-1 focus:ring-aura-accent
            transition-all duration-200 cursor-pointer
          "
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-aura-card text-aura-text">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-aura-text-faint">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
}

Select.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  className: PropTypes.string,
};
