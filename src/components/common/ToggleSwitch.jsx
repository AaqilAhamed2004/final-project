import React from 'react';
import PropTypes from 'prop-types';

export default function ToggleSwitch({ isSpecial, onChange, labelLeft = 'STANDARD', labelRight = 'SPECIAL' }) {
  return (
    <div className="flex items-center p-1 bg-black rounded-full border border-white/10 w-fit">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-widest transition-colors duration-200 ${!isSpecial ? 'bg-aura-amber text-black' : 'text-white/40 hover:text-white/70'}`}
      >
        {labelLeft}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-widest transition-colors duration-200 ${isSpecial ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white/70'}`}
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
