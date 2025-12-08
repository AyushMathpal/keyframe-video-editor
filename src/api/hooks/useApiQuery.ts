"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from "@tanstack/react-query";
import { type AxiosError } from "axios";

import request from "~/lib/request";

/**
 * Generic error type for API responses
 */
export interface ApiError {
  detail: string;
  code?: string;
  field?: string;
}

/**
 * Custom hook for GET requests with React Query
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = useApiQuery<UserResponse>(
 *   ["users", userId],
 *   `/users/${userId}`
 * );
 * ```
 */
export function useApiQuery<TResponse>(
  queryKey: QueryKey,
  url: string,
  params?: Record<string, unknown>,
  options?: Omit<
    UseQueryOptions<TResponse, AxiosError<ApiError>>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<TResponse, AxiosError<ApiError>>({
    queryKey,
    queryFn: () => request.get<typeof params, TResponse>(url, params),
    ...options,
  });
}

/**
 * Custom hook for POST mutations with React Query
 *
 * @example
 * ```typescript
 * const { mutate, mutateAsync, isPending } = useApiMutation<
 *   CreateUserPayload,
 *   UserResponse
 * >("/users", {
 *   onSuccess: () => {
 *     queryClient.invalidateQueries({ queryKey: ["users"] });
 *   },
 * });
 *
 * // Usage
 * mutate({ name: "John", email: "john@example.com" });
 * ```
 */
export function useApiMutation<TPayload, TResponse>(
  url: string,
  options?: Omit<
    UseMutationOptions<TResponse, AxiosError<ApiError>, TPayload>,
    "mutationFn"
  >,
) {
  return useMutation<TResponse, AxiosError<ApiError>, TPayload>({
    mutationFn: (data) => request.post<TPayload, TResponse>(url, data),
    ...options,
  });
}

/**
 * Custom hook for PUT mutations with React Query
 */
export function useApiPutMutation<TPayload, TResponse>(
  url: string,
  options?: Omit<
    UseMutationOptions<TResponse, AxiosError<ApiError>, TPayload>,
    "mutationFn"
  >,
) {
  return useMutation<TResponse, AxiosError<ApiError>, TPayload>({
    mutationFn: (data) => request.put<TPayload, TResponse>(url, data),
    ...options,
  });
}

/**
 * Custom hook for DELETE mutations with React Query
 */
export function useApiDeleteMutation<TPayload, TResponse>(
  url: string,
  options?: Omit<
    UseMutationOptions<TResponse, AxiosError<ApiError>, TPayload>,
    "mutationFn"
  >,
) {
  return useMutation<TResponse, AxiosError<ApiError>, TPayload>({
    mutationFn: (data) => request.delete<TPayload, TResponse>(url, data),
    ...options,
  });
}

/**
 * Hook to get the query client for manual cache operations
 */
export { useQueryClient };
