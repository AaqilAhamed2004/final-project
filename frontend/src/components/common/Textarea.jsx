import React from 'react';
import PropTypes from 'prop-types';

/**
 * Textarea — themed multi-line input.
 */
export default function Textarea({ label, id, className = '', ...props }) {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="mb-2 text-sm text-aura-text-muted font-sans font-medium">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className="
          bg-aura-surface border border-aura-border rounded-lg px-4 py-3
          text-aura-text text-sm placeholder:text-aura-text-faint
          focus:outline-none focus:border-aura-accent focus:ring-1 focus:ring-aura-accent
          transition-all duration-200 resize-y min-h-[100px]
        "
        {...props}
      />
    </div>
  );
}

Textarea.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
};
