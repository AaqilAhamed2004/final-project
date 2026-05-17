import React from 'react';
import PropTypes from 'prop-types';

/**
 * ToggleSwitch — pill-style binary toggle.
 * Uses theme tokens for active/inactive states.
 */
export default function ToggleSwitch({ isSpecial, onChange, labelLeft = 'STANDARD', labelRight = 'SPECIAL' }) {
  return (
    <div className="flex items-center p-1 bg-aura-bg rounded-full border border-aura-border w-fit">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-widest transition-all duration-200 ${
          !isSpecial
            ? 'bg-aura-accent text-aura-bg shadow-aura-glow-sm'
            : 'text-aura-text-faint hover:text-aura-text-muted'
        }`}
      >
        {labelLeft}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-widest transition-all duration-200 ${
          isSpecial
            ? 'bg-aura-surface text-aura-text border border-aura-border-strong'
            : 'text-aura-text-faint hover:text-aura-text-muted'
        }`}
      >
        {labelRight}
      </button>
    </div>
  );
}

ToggleSwitch.propTypes = {
  isSpecial: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  labelLeft: PropTypes.string,
  labelRight: PropTypes.string,
};
