// === frontend/src/hooks/useOptimization.js ===
// Purpose: Custom hook for running truck optimization and managing results
// Dependencies: @tanstack/react-query, ../api/optimization.api, ../store/shipmentStore

// import { useMutation, useQuery } from '@tanstack/react-query';  // TODO: uncomment
// import * as optimizationApi from '../api/optimization.api';       // TODO: uncomment

/**
 * TODO: Implement useOptimization hook
 *
 * Purpose: Encapsulate the optimization workflow for the OptimizationPage
 *
 * Returns:
 *   runOptimization(shipmentIds)  — Trigger scoring (useMutation)
 *   results: array                — Scored trucks from last run
 *   isOptimizing: boolean         — Mutation loading state
 *   selectedTruck: object | null  — User-selected truck from results
 *   selectTruck(truck)            — Set selected truck
 *   cacheKey: string | null       — Redis cache key for the result set
 *   error: string | null
 *
 * Flow:
 *   1. User selects shipments on OptimizationPage
 *   2. Calls runOptimization with selected IDs
 *   3. useMutation calls optimizationApi.runOptimization
 *   4. On success: store results and cacheKey in local state
 *   5. Results displayed via OptimizationPanel
 *   6. User clicks a TruckResultCard → selectTruck(truck)
 *   7. BookingPage reads selectedTruck to create booking request
 *
 * Called by: OptimizationPage, BookingPage
 */

// export function useOptimization() {
//   // TODO: Implement optimization workflow hook
// }
