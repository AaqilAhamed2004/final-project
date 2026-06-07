/**
 * @fileoverview AURA — Typed API Client
 *
 * Centralised HTTP layer for all backend communication.
 * All functions return typed promises matching the JSDoc types in src/types/index.js.
 *
 * Key design decisions:
 * - Single `apiFetch` core handles JWT injection, error parsing, and 401 session expiry.
 * - Login uses application/x-www-form-urlencoded (Spring Boot form login requirement).
 * - All other requests use JSON.
 * - Backend serializes all responses as snake_case (Spring Jackson SNAKE_CASE strategy).
 */

/** @import { LoginResponse, User, ReliefRequest, InventoryItem, PrologAnalysis, ContributionDto, PublicStats, Booking } from '../types/index.js' */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ─────────────────────────────────────────────────────────────────────────────
// Core Fetch Helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Core fetch helper — attaches JWT, parses JSON, handles errors.
 * @param {string} endpoint - API path (e.g. '/api/auth/me')
 * @param {RequestInit} [options] - Fetch options
 * @returns {Promise<any>}
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('aura_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })

  // Handle empty responses (e.g. DELETE 204 No Content)
  let data = null
  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    data = await res.json()
  }

  if (!res.ok) {
    // Session expired or token invalid — force logout
    if (res.status === 401) {
      localStorage.removeItem('aura_token')
      localStorage.removeItem('aura_user')
      window.dispatchEvent(new Event('aura_logout'))
      window.location.href = '/login'
    }
    // Extract the error message from the backend's {"detail": "..."} format
    const message = data?.detail || data?.message || `Request failed with status ${res.status}`
    throw new Error(message)
  }

  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Login with email and password. Uses form-urlencoded as required by Spring Boot.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<LoginResponse>}
 */
export const loginUser = (email, password) => {
  const body = new URLSearchParams()
  body.append('username', email) // Spring Security reads email from 'username' field
  body.append('password', password)
  return apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
}

/**
 * Register a new user account.
 * @param {{ full_name: string, email: string, password: string, role: string }} data
 * @returns {Promise<User>}
 */
export const registerUser = (data) =>
  apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) })

/**
 * Get the currently authenticated user's profile.
 * @returns {Promise<User>}
 */
export const getMe = () => apiFetch('/api/auth/me')

// ─────────────────────────────────────────────────────────────────────────────
// Relief Requests
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new relief request. Triggers AI analysis in the background.
 * @param {Object} data - ReliefRequestCreateDto fields
 * @returns {Promise<ReliefRequest>}
 */
export const createRequest = (data) =>
  apiFetch('/api/requests', { method: 'POST', body: JSON.stringify(data) })

/**
 * Get all relief requests (any authenticated user).
 * @returns {Promise<ReliefRequest[]>}
 */
export const getAllRequests = () => apiFetch('/api/requests')

/**
 * Get only requests created by the current user.
 * @returns {Promise<ReliefRequest[]>}
 */
export const getMyRequests = () => apiFetch('/api/requests/my')

/**
 * Update the status of a relief request.
 * @param {string} id - Request document ID
 * @param {string} status - New status value
 * @returns {Promise<ReliefRequest>}
 */
export const updateStatus = (id, status) =>
  apiFetch(`/api/requests/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

// ─────────────────────────────────────────────────────────────────────────────
// Prolog / AI Logic Engine
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Manually trigger AI priority analysis for a request (returns result synchronously).
 * @param {string} id - Request document ID
 * @returns {Promise<PrologAnalysis>}
 */
export const triggerAnalysis = (id) =>
  apiFetch(`/api/logic/analyze/${id}`, { method: 'POST' })

/**
 * Get the stored AI analysis result for a request.
 * @param {string} id - Request document ID
 * @returns {Promise<PrologAnalysis>}
 */
export const getAnalysis = (id) => apiFetch(`/api/logic/analysis/${id}`)

// ─────────────────────────────────────────────────────────────────────────────
// Inventory Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all inventory items.
 * @returns {Promise<InventoryItem[]>}
 */
export const getInventory = () => apiFetch('/api/inventory')

/**
 * Add a new inventory item.
 * @param {Partial<InventoryItem>} data
 * @returns {Promise<InventoryItem>}
 */
export const addInventoryItem = (data) =>
  apiFetch('/api/inventory', { method: 'POST', body: JSON.stringify(data) })

/**
 * Partially update an inventory item's fields.
 * @param {string} id - Item document ID
 * @param {Partial<InventoryItem>} data - Fields to update (snake_case)
 * @returns {Promise<InventoryItem>}
 */
export const updateInventoryItem = (id, data) =>
  apiFetch(`/api/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) })

/**
 * Delete an inventory item.
 * @param {string} id - Item document ID
 * @returns {Promise<{ message: string }>}
 */
export const deleteInventoryItem = (id) =>
  apiFetch(`/api/inventory/${id}`, { method: 'DELETE' })

/**
 * Book (reserve) a quantity from an inventory item.
 * @param {string} id - Item document ID
 * @param {number} quantity - Quantity to reserve
 * @returns {Promise<{ message: string, remaining_quantity: number }>}
 */
export const bookInventoryItem = (id, quantity) =>
  apiFetch(`/api/inventory/${id}/book`, {
    method: 'POST',
    body: JSON.stringify({ quantity }),
  })

// ─────────────────────────────────────────────────────────────────────────────
// Public Board
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all public relief requests for the donor board.
 * @returns {Promise<ReliefRequest[]>}
 */
export const getPublicBoard = () => apiFetch('/api/public/board')

/**
 * Get public statistics for the landing page.
 * @returns {Promise<PublicStats>}
 */
export const getPublicStats = () => apiFetch('/api/public/stats')

/**
 * Book (donate to) a relief request.
 * @param {string} id - Request document ID
 * @param {string} [notes] - Optional donor notes
 * @returns {Promise<{ message: string, booking_id: string }>}
 */
export const bookRequest = (id, notes) =>
  apiFetch('/api/public/book', {
    method: 'POST',
    body: JSON.stringify({ request_id: id, notes }),
  })

/**
 * Get all contributions (bookings) made by the current user.
 * @returns {Promise<ContributionDto[]>}
 */
export const getMyContributions = () => apiFetch('/api/public/my-contributions')