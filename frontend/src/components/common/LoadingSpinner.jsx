import React from 'react';

/**
 * LoadingSpinner — theme-aware spinner.
 */
export default function LoadingSpinner({ size = 32, className = '' }) {
  return (
    <div
      className={`rounded-full border-2 border-aura-border border-t-aura-accent animate-spin ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
