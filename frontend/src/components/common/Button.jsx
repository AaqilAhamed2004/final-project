import React from 'react';
import PropTypes from 'prop-types';

/**
 * Button — themed action button.
 * Variants map to semantic theme tokens so dark/light mode is handled automatically.
 */
export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyle = 'px-4 py-2 font-mono text-sm font-bold tracking-wider uppercase transition-all duration-200 rounded-lg flex justify-center items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-accent';

  const variants = {
    primary:   'bg-aura-accent text-aura-bg hover:bg-aura-accent-hover shadow-aura-glow-sm hover:shadow-aura-glow',
    secondary: 'bg-transparent border border-aura-accent text-aura-accent hover:bg-aura-accent-muted',
    danger:    'bg-aura-red text-aura-bg hover:opacity-90',
    ghost:     'bg-transparent text-aura-text-muted hover:bg-aura-surface-hover hover:text-aura-text border border-aura-border',
  };

  return (
    <button className={`${baseStyle} ${variants[variant] ?? variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  className: PropTypes.string,
};
