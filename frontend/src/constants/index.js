export const ROLES = {
  GN_OFFICER: 'gn_officer',
  DONOR: 'donor',
  SUPER_ADMIN: 'super_admin',
};

export const PRIORITY_LEVELS = {
  RED: 'red',       // was CRITICAL
  ORANGE: 'orange', // was MODERATE
  YELLOW: 'yellow', // was LOW
};

export const SUPPLY_CATEGORIES = {
  MEDICINE: 'medicine',
  FOOD: 'food',
  SHELTER: 'shelter',
  OTHER: 'other',
};

export const STATUS_TYPES = {
  PENDING: 'pending',
  APPROVED: 'approved',     // was ASSIGNED
  FULFILLED: 'fulfilled',   // was DELIVERED
  CANCELLED: 'cancelled',   // new
};
