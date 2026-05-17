import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card — themed surface container.
 * Uses CSS variable tokens; automatically adapts to dark/light mode.
 */
export default function Card({ children, highlight = false, className = '' }) {
  const highlightStyle = highlight
    ? 'border-aura-accent shadow-aura-glow'
    : 'border-aura-border';

  return (
    <div className={`bg-aura-card border ${highlightStyle} rounded-aura p-6 shadow-aura-card transition-colors duration-200 ${className}`}>
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  highlight: PropTypes.bool,
  className: PropTypes.string,
};
