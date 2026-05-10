import React from 'react';
import PropTypes from 'prop-types';

export default function Card({ children, highlight = false, className = '' }) {
  const highlightStyle = highlight ? 'border-aura-amber shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-white/5';
  
  return (
    <div className={`bg-aura-card border ${highlightStyle} rounded p-6 ${className}`}>
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  highlight: PropTypes.bool,
  className: PropTypes.string,
};
