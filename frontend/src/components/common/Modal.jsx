import React from 'react';
import PropTypes from 'prop-types';

/**
 * Modal — themed overlay dialog.
 * Uses theme tokens so it adapts to dark/light mode automatically.
 */
export default function Modal({ isOpen, onClose, children, className = '' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      {/* Background overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Content */}
      <div className={`relative z-10 w-full max-w-2xl bg-aura-card border border-aura-border rounded-aura shadow-aura-card overflow-hidden transition-colors duration-200 ${className}`}>
        {children}
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
