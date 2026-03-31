// === frontend/src/store/shipmentStore.js ===
// Purpose: Zustand store for shipment list state, filters, and selection
// Dependencies: zustand, ../api/shipment.api

// import { create } from 'zustand';                // TODO: uncomment
// import * as shipmentApi from '../api/shipment.api'; // TODO: uncomment

/**
 * TODO: Create shipmentStore
 *
 * STATE:
 *   shipments: array             — List of shipments for current page
 *   total: number                — Total count for pagination
 *   selectedIds: Set<string>     — Selected shipment IDs (for batch optimization)
 *   filters: { status, page, limit, search }
 *   isLoading: boolean
 *
 * ACTIONS:
 *   fetchShipments(filters)      — Load shipments from API with filters
 *   toggleSelect(id)             — Add/remove shipment from selection
 *   selectAll()                  — Select all visible shipments
 *   clearSelection()             — Clear all selections
 *   setFilter(key, value)        — Update a filter and refetch
 *   resetFilters()               — Reset to defaults and refetch
 *
 * Called by: ShipmentListPage, OptimizationPage
 */
