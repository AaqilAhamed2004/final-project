import React from 'react';
import PropTypes from 'prop-types';

export default function Input({ label, id, className = '', iconLeft: IconLeft, iconRight: IconRight, onIconRightClick, ...props }) {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && <label htmlFor={id} className="mb-2 text-sm text-white/70 font-sans">{label}</label>}
      <div className="relative flex items-center">
        {IconLeft && <IconLeft size={16} className="absolute left-3 text-white/40" />}
        <input
          id={id}
          className={`w-full bg-aura-bg border border-white/10 rounded py-2.5 text-sm text-white focus:outline-none focus:border-aura-amber transition-colors duration-200 ${IconLeft ? 'pl-10' : 'pl-4'} ${IconRight ? 'pr-10' : 'pr-4'}`}
          {...props}
        />
        {IconRight && (
          <button type="button" onClick={onIconRightClick} className="absolute right-3 text-white/40 hover:text-white/70 focus:outline-none">
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
