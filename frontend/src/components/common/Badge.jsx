import React from 'react';
import PropTypes from 'prop-types';
import { getPriorityColor, getPriorityLabel } from '../../utils/priorityHelpers';
import { PRIORITY_LEVELS } from '../../constants';

export default function Badge({ priority, className = '' }) {
  const colors = getPriorityColor(priority);
  const label  = getPriorityLabel(priority);

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-mono tracking-wider rounded uppercase ${colors} ${className}`}>
      {(priority || '').toUpperCase() === PRIORITY_LEVELS.CRITICAL && <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />}
      {label}
    </span>
  );
}


Badge.propTypes = {
  priority: PropTypes.string.isRequired,
  className: PropTypes.string,
};
