/**
 * Query Keys Factory
 *
 * Centralized query key management for React Query.
 * This ensures consistent cache invalidation and prevents typos.
 *
 * Usage:
 * ```typescript
 * // In a query hook
 * queryKey: queryKeys.health.check()
 *
 * // Invalidate all health queries
 * queryClient.invalidateQueries({ queryKey: queryKeys.health.all })
 * ```
 */

export const queryKeys = {
  // Health check queries
  health: {
    all: ["health"] as const,
    check: () => [...queryKeys.health.all, "check"] as const,
  },

  // Add more query key groups as your API grows
  // Example:
  // users: {
  //   all: ["users"] as const,
  //   lists: () => [...queryKeys.users.all, "list"] as const,
  //   list: (filters: UserFilters) => [...queryKeys.users.lists(), filters] as const,
  //   details: () => [...queryKeys.users.all, "detail"] as const,
  //   detail: (id: string) => [...queryKeys.users.details(), id] as const,
  // },

  // projects: {
  //   all: ["projects"] as const,
  //   lists: () => [...queryKeys.projects.all, "list"] as const,
  //   list: (filters?: ProjectFilters) => [...queryKeys.projects.lists(), filters] as const,
  //   details: () => [...queryKeys.projects.all, "detail"] as const,
  //   detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  // },
};

export type QueryKeys = typeof queryKeys;
