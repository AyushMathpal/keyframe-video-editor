/**
 * API Module
 *
 * Centralized exports for all API-related functionality.
 *
 * Usage:
 * ```typescript
 * // Import hooks
 * import { useHealthCheck, useApiQuery, useApiMutation } from "~/api";
 *
 * // Import query keys for cache invalidation
 * import { queryKeys } from "~/api";
 *
 * // Import types
 * import type { ApiError, HealthCheckResponse } from "~/api";
 * ```
 */

// React Query hooks
export * from "./hooks";

// Query keys factory
export { queryKeys, type QueryKeys } from "./query-keys";
