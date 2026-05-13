import React from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';

export default function Select({ label, id, options, className = '', ...props }) {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && <label htmlFor={id} className="mb-2 text-sm text-white/70 font-sans">{label}</label>}
      <div className="relative">
        <select
          id={id}
          className="w-full bg-aura-bg border border-white/10 rounded px-4 py-3 text-white appearance-none focus:outline-none focus:border-aura-amber transition-colors duration-200 cursor-pointer"
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-white/50">
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
