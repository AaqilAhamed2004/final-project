import { PRIORITY_LEVELS, STATUS_TYPES } from '../constants';

/**
 * Maps a priority_level string from the API to Tailwind CSS classes.
 * Accepts: "Critical", "Urgent", "Standard" (from MongoDB/AI engine)
 */
export const getPriorityColor = (priority) => {
  switch (priority) {
    case PRIORITY_LEVELS.CRITICAL: return 'text-aura-red bg-aura-red/10 border border-aura-red/30';
    case PRIORITY_LEVELS.URGENT:   return 'text-aura-orange bg-aura-orange/10 border border-aura-orange/30';
    case PRIORITY_LEVELS.STANDARD: return 'text-aura-yellow bg-aura-yellow/10 border border-aura-yellow/30';
    default:                       return 'text-gray-400 bg-gray-400/10 border border-gray-400/30';
  }
};

/**
 * Maps a priority_level string to a human-readable display label.
 */
export const getPriorityLabel = (priority) => {
  switch (priority) {
    case PRIORITY_LEVELS.CRITICAL: return 'CRITICAL PRIORITY';
    case PRIORITY_LEVELS.URGENT:   return 'URGENT PRIORITY';
    case PRIORITY_LEVELS.STANDARD: return 'STANDARD PRIORITY';
    default:                       return 'UNKNOWN PRIORITY';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case STATUS_TYPES.PENDING:   return 'text-gray-400 border-gray-400';
    case STATUS_TYPES.APPROVED:  return 'text-aura-amber border-aura-amber';
    case STATUS_TYPES.ONGOING:   return 'text-blue-400 border-blue-400';
    case STATUS_TYPES.COMPLETED: return 'text-green-500 border-green-500';
    case STATUS_TYPES.FULFILLED: return 'text-green-500 border-green-500';
    case STATUS_TYPES.CANCELLED: return 'text-aura-red border-aura-red';
    default:                     return 'text-gray-400 border-gray-400';
  }
};


export const formatRequestId = (id) => {
  return id.startsWith('#') ? id : `#${id}`;
};

export const formatTimestamp = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
