import React from 'react';
import PropTypes from 'prop-types';
import { getStatusColor } from '../../utils/priorityHelpers';

export default function StatusBadge({ status, className = '' }) {
  const colors = getStatusColor(status);
  
  return (
    <span className={`inline-flex items-center px-3 py-1 text-[10px] font-mono tracking-widest rounded-full border bg-transparent uppercase ${colors} ${className}`}>
      {status}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  className: PropTypes.string,
};
