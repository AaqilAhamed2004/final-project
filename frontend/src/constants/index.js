export const ROLES = {
  GN_OFFICER: 'gn_officer',
  DONOR: 'donor',
  SUPER_ADMIN: 'super_admin',
};

// These MUST match the strings written to MongoDB by prolog_worker_cli.py
export const PRIORITY_LEVELS = {
  CRITICAL: 'Critical',
  URGENT:   'Urgent',
  STANDARD: 'Standard',
};

export const SUPPLY_CATEGORIES = {
  MEDICINE: 'medicine',
  FOOD:     'food',
  SHELTER:  'shelter',
  OTHER:    'other',
};

export const STATUS_TYPES = {
  PENDING:   'pending',
  APPROVED:  'approved',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled',
};
