import { PRIORITY_LEVELS, STATUS_TYPES } from '../constants';

/**
 * Maps a priority_level string from the API to Tailwind CSS classes.
 * Uses aura-* theme tokens — automatically adapts to dark/light mode.
 *
 * Spring Boot now returns: "Critical", "Urgent", "Standard"
 * This function normalises to UPPER CASE before comparing, so it accepts
 * any case variation: "CRITICAL", "Critical", "critical" all work.
 *
 * @param {string} priority - Priority level string from API
 * @returns {string} Tailwind CSS class string
 */
export const getPriorityColor = (priority) => {
  const p = (priority || '').toUpperCase();
  switch (p) {
    case PRIORITY_LEVELS.CRITICAL: return 'text-aura-red bg-aura-red/10 border border-aura-red/30';
    case PRIORITY_LEVELS.URGENT:   return 'text-aura-orange bg-aura-orange/10 border border-aura-orange/30';
    case PRIORITY_LEVELS.STANDARD: return 'text-aura-yellow bg-aura-yellow/10 border border-aura-yellow/30';
    default:                       return 'text-aura-text-muted bg-aura-surface border border-aura-border';
  }
};

/**
 * Maps a priority_level string to a human-readable display label.
 * Accepts "Critical", "Urgent", "Standard" from Spring Boot.
 *
 * @param {string} priority - Priority level string from API
 * @returns {string} Display label string
 */
export const getPriorityLabel = (priority) => {
  const p = (priority || '').toUpperCase();
  switch (p) {
    case PRIORITY_LEVELS.CRITICAL: return 'CRITICAL PRIORITY';
    case PRIORITY_LEVELS.URGENT:   return 'URGENT PRIORITY';
    case PRIORITY_LEVELS.STANDARD: return 'STANDARD PRIORITY';
    default:                       return (priority || 'UNKNOWN').toUpperCase();
  }
};

/**
 * Maps a request status string to Tailwind CSS border + text classes.
 * @param {string} status - Status string from API
 * @returns {string} Tailwind CSS class string
 */
export const getStatusColor = (status) => {
  switch (status) {
    case STATUS_TYPES.PENDING:   return 'text-aura-text-muted border-aura-border-strong';
    case STATUS_TYPES.APPROVED:  return 'text-aura-accent border-aura-accent';
    case STATUS_TYPES.ONGOING:   return 'text-aura-blue border-aura-blue';
    case STATUS_TYPES.COMPLETED: return 'text-aura-green border-aura-green';
    case STATUS_TYPES.FULFILLED: return 'text-aura-green border-aura-green';
    case STATUS_TYPES.CANCELLED: return 'text-aura-red border-aura-red';
    default:                     return 'text-aura-text-faint border-aura-border';
  }
};

/**
 * Formats a MongoDB document ID into a short human-readable request code.
 * @param {string} id - MongoDB ObjectId string
 * @returns {string} Formatted ID (e.g. "#A3F")
 */
export const formatRequestId = (id) => {
  if (!id) return '#N/A';
  return String(id).startsWith('#') ? String(id) : `#${id}`;
};

/**
 * Formats an ISO 8601 timestamp into a short localized date-time string.
 * @param {string} isoString - ISO 8601 timestamp from API
 * @returns {string} Formatted date-time (e.g. "Jun 07, 10:45 AM")
 */
export const formatTimestamp = (isoString) => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};
