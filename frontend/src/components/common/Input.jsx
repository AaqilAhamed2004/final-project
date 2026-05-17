import React from 'react';
import PropTypes from 'prop-types';

/**
 * Input — themed text input field.
 * All colors use theme tokens; adapts automatically to dark/light mode.
 */
export default function Input({ label, id, className = '', iconLeft: IconLeft, iconRight: IconRight, onIconRightClick, ...props }) {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && (
        <label htmlFor={id} className="mb-2 text-sm text-aura-text-muted font-sans font-medium">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {IconLeft && <IconLeft size={16} className="absolute left-3 text-aura-text-faint pointer-events-none" />}
        <input
          id={id}
          className={`
            w-full bg-aura-surface border border-aura-border rounded-lg py-2.5 text-sm text-aura-text
            placeholder:text-aura-text-faint
            focus:outline-none focus:border-aura-accent focus:ring-1 focus:ring-aura-accent
            transition-all duration-200
            ${IconLeft ? 'pl-10' : 'pl-4'}
            ${IconRight ? 'pr-10' : 'pr-4'}
          `}
          {...props}
        />
        {IconRight && (
          <button
            type="button"
            onClick={onIconRightClick}
            className="absolute right-3 text-aura-text-faint hover:text-aura-text-muted focus:outline-none transition-colors"
          >
            <IconRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

Input.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  iconLeft: PropTypes.elementType,
  iconRight: PropTypes.elementType,
  onIconRightClick: PropTypes.func,
};
