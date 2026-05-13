import React from 'react';
import PropTypes from 'prop-types';

export default function Textarea({ label, id, className = '', ...props }) {
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && <label htmlFor={id} className="mb-2 text-sm text-white/70 font-sans">{label}</label>}
      <textarea
        id={id}
        className="bg-aura-bg border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-aura-amber transition-colors duration-200 resize-y min-h-[100px]"
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
