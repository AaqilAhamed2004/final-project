export const ROLES = {
  GN_OFFICER: 'gn_officer',
  DONOR: 'donor',
  SUPER_ADMIN: 'super_admin',
};

/**
 * PRIORITY_LEVELS — Must match PriorityRulesService.mapPriorityLabel() output.
 * Spring Boot returns: "Critical", "Urgent", "Standard"
 * (set in uppercase here for switch-case matching after .toUpperCase())
 */
export const PRIORITY_LEVELS = {
  CRITICAL: 'CRITICAL',   // Spring Boot: "Critical"
  URGENT:   'URGENT',     // Spring Boot: "Urgent"   (was MODERATE)
  STANDARD: 'STANDARD',   // Spring Boot: "Standard" (was LOW)
  // Legacy aliases — keep for backward compatibility with any old data
  MODERATE: 'URGENT',
  LOW:      'STANDARD',
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
  ONGOING:   'ongoing',
  COMPLETED: 'completed',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled',
};

