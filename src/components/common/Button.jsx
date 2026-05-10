import React from 'react';
import PropTypes from 'prop-types';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyle = 'px-4 py-2 font-mono text-sm font-bold tracking-wider uppercase transition-colors duration-200 rounded flex justify-center items-center gap-2';
  
  const variants = {
    primary: 'bg-aura-amber text-aura-bg hover:bg-yellow-400',
    secondary: 'bg-transparent border border-aura-amber text-aura-amber hover:bg-aura-amber/10',
    danger: 'bg-aura-red text-white hover:bg-red-700',
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  className: PropTypes.string,
};
