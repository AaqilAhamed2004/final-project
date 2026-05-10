import { PRIORITY_LEVELS, STATUS_TYPES } from '../constants';

export const getPriorityColor = (priority) => {
  switch (priority) {
    case PRIORITY_LEVELS.CRITICAL: return 'text-aura-red bg-aura-red/10 border-aura-red/30';
    case PRIORITY_LEVELS.MODERATE: return 'text-aura-orange bg-aura-orange/10 border-aura-orange/30';
    case PRIORITY_LEVELS.LOW: return 'text-aura-yellow bg-aura-yellow/10 border-aura-yellow/30';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  }
};

export const getPriorityLabel = (priority) => {
  switch (priority) {
    case PRIORITY_LEVELS.CRITICAL: return 'CRITICAL PRIORITY';
    case PRIORITY_LEVELS.MODERATE: return 'MODERATE PRIORITY';
    case PRIORITY_LEVELS.LOW: return 'LOW PRIORITY';
    default: return 'UNKNOWN PRIORITY';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case STATUS_TYPES.PENDING: return 'text-gray-400 border-gray-400';
    case STATUS_TYPES.ASSIGNED: return 'text-aura-amber border-aura-amber';
    case STATUS_TYPES.DELIVERED: return 'text-green-500 border-green-500';
    default: return 'text-gray-400 border-gray-400';
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
