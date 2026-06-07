/**
 * @fileoverview AURA — TypeScript-style JSDoc type definitions
 *
 * Phase 4 migration: All data shapes are defined here as JSDoc @typedef blocks.
 * These give full IDE intellisense, type checking, and autocomplete across every
 * component without requiring a full TypeScript compilation setup.
 *
 * These types mirror the JSON shapes returned by the Spring Boot backend,
 * which serializes all fields as snake_case (Jackson SNAKE_CASE strategy).
 */

// ─────────────────────────────────────────────────────────────────────────────
// User / Authentication
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {'gn_officer' | 'donor' | 'super_admin'} UserRole
 */

/**
 * Authenticated user object stored in AuthContext and localStorage.
 * @typedef {Object} User
 * @property {string} id - MongoDB document ID
 * @property {string} email - User's email address
 * @property {string} full_name - User's full display name
 * @property {UserRole} role - User's role in the system
 * @property {boolean} [is_active] - Whether the account is active
 */

/**
 * Response from POST /api/auth/login
 * @typedef {Object} LoginResponse
 * @property {string} access_token - JWT bearer token
 * @property {string} token_type - Always "bearer"
 * @property {User} user - The authenticated user object
 */

// ─────────────────────────────────────────────────────────────────────────────
// Relief Requests
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {'medicine' | 'food' | 'shelter' | 'other'} ItemCategory
 */

/**
 * @typedef {'available' | 'low' | 'empty'} StockLevel
 */

/**
 * An individual supply item within a relief request.
 * @typedef {Object} RequestItem
 * @property {string} item_name - Human-readable item name
 * @property {ItemCategory} category - Supply category
 * @property {number} quantity - Quantity requested
 * @property {number} [quantity_needed] - Alias for quantity
 * @property {number} [current_stock] - Current available stock level
 * @property {string} [prolog_item_key] - Auto-generated snake_case key for AI analysis
 */

/**
 * @typedef {'pending' | 'approved' | 'ongoing' | 'completed' | 'fulfilled' | 'cancelled'} RequestStatus
 */

/**
 * @typedef {'Standard' | 'Urgent' | 'Critical'} PriorityLabel
 */

/**
 * @typedef {'clear' | 'partial' | 'flooded' | 'blocked'} RoadStatus
 */

/**
 * @typedef {'small' | 'medium' | 'large'} PopulationSize
 */

/**
 * A relief request document from MongoDB.
 * @typedef {Object} ReliefRequest
 * @property {string} id - MongoDB document ID (Spring Boot serializes _id as id)
 * @property {string} [_id] - Alias kept for backward compatibility
 * @property {string} title - Request title
 * @property {string} [description] - Request description
 * @property {string} location - Geographic location
 * @property {RequestItem[]} items - List of requested supply items
 * @property {RequestStatus} status - Current workflow status
 * @property {RoadStatus} road_status - Road accessibility status
 * @property {PopulationSize} population_size - Affected population size
 * @property {boolean} is_public - Whether visible on the public donor board
 * @property {string} creator_id - ID of the GN Officer who created it
 * @property {string} created_at - ISO 8601 creation timestamp
 * @property {PriorityLabel} priority_level - AI-assigned priority label
 * @property {string} [request_type] - Type of relief operation
 * @property {string} [urgency_level] - Urgency descriptor
 * @property {string} [etd] - Estimated time of delivery
 * @property {string} [assigned_team] - Assigned logistics team
 */

// ─────────────────────────────────────────────────────────────────────────────
// Inventory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * An inventory item document from MongoDB.
 * @typedef {Object} InventoryItem
 * @property {string} id - MongoDB document ID
 * @property {string} [_id] - Alias kept for backward compatibility
 * @property {string} item_name - Human-readable item name
 * @property {ItemCategory} category - Supply category
 * @property {number} quantity - Current stock quantity
 * @property {string} [location] - Storage location
 * @property {string} [warehouse] - Warehouse identifier
 * @property {string} [condition] - Item condition (e.g., "Good", "Damaged")
 * @property {string} [bin_location] - Bin/shelf location within warehouse
 * @property {string} [expiration_date] - Expiry date (ISO string or human-readable)
 * @property {string} [last_audit] - Date of last inventory audit
 */

// ─────────────────────────────────────────────────────────────────────────────
// AI Prolog Analysis
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {'red' | 'orange' | 'yellow'} PriorityColor
 */

/**
 * The result of the AURA AI priority analysis pipeline.
 * @typedef {Object} PrologAnalysis
 * @property {string} id - MongoDB document ID
 * @property {string} request_id - ID of the analyzed relief request
 * @property {PriorityLabel} priority_level - Human-readable priority label
 * @property {PriorityColor} priority_color - Color code for UI rendering
 * @property {number} priority_score - Numeric score (30=yellow, 60=orange, 90=red)
 * @property {string[]} risk_flags - List of risk flag messages (from RiskAssessmentService)
 * @property {string[]} risk_factors - Alias of risk_flags (frontend backward compatibility)
 * @property {string} rationale - Human-readable explanation of the priority decision
 * @property {string} analyzed_at - ISO 8601 timestamp of analysis
 */

// ─────────────────────────────────────────────────────────────────────────────
// Bookings / Contributions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A donor booking record.
 * @typedef {Object} Booking
 * @property {string} id - MongoDB document ID
 * @property {string} request_id - ID of the booked relief request
 * @property {string} [notes] - Optional notes from the donor
 * @property {string} donor_id - ID of the donor user
 * @property {string} booked_at - ISO 8601 booking timestamp
 */

/**
 * Enriched contribution entry returned by GET /api/public/my-contributions
 * @typedef {Object} ContributionDto
 * @property {string} booking_id - Booking document ID
 * @property {string} request_id - Related relief request ID
 * @property {string} title - Request title
 * @property {string} location - Request location
 * @property {RequestStatus} status - Current request status
 * @property {PriorityLabel} priority_level - Priority label
 * @property {string} booked_at - ISO 8601 booking timestamp
 * @property {RequestItem[]} items - Items from the original request
 * @property {string} [notes] - Donor notes
 */

// ─────────────────────────────────────────────────────────────────────────────
// Public Statistics
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Public statistics returned by GET /api/public/stats
 * @typedef {Object} PublicStats
 * @property {number} total_requests - Total relief requests in the system
 * @property {number} active_relief_zones - Number of distinct active locations
 * @property {number} total_donors - Total registered donor accounts
 * @property {number} items_distributed - Estimated items distributed (completed * 50)
 */

export {}
