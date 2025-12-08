"use client";

import { useApiQuery } from "./useApiQuery";
import { queryKeys } from "../query-keys";

/**
 * Health check response type
 */
export interface HealthCheckResponse {
  status: string;
}

/**
 * Hook to check backend health status
 *
 * @example
 * ```typescript
 * function StatusIndicator() {
 *   const { data, isLoading, isError } = useHealthCheck();
 *
 *   if (isLoading) return <span>Checking...</span>;
 *   if (isError) return <span className="text-red-500">Offline</span>;
 *   return <span className="text-green-500">{data?.status}</span>;
 * }
 * ```
 */
export function useHealthCheck() {
  return useApiQuery<HealthCheckResponse>(
    queryKeys.health.check(),
    "/api/v1/health",
    undefined,
    {
      retry: false,
      refetchInterval: 30000,
      staleTime: 10000,
    },
  );
}
