"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type AxiosError } from "axios";

import request from "~/lib/request";
import { type ApiError } from "./useApiQuery";

/**
 * Request payload for starting a processing job
 */
export interface ProcessRequest {
  script_text: string;
}

/**
 * Response when a processing job is started
 */
export interface ProcessStartResponse {
  job_id: string;
  status: string;
  message: string;
}

/**
 * Response for processing job status
 */
export interface ProcessStatusResponse {
  job_id: string;
  project_id: string;
  status: "pending" | "processing" | "complete" | "error";
  video_url: string | null;
  xml_url: string | null;
  video_size: number | null;
  xml_size: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

/**
 * Query key factory for process-related queries
 */
export const processKeys = {
  all: ["process"] as const,
  status: (projectId: string) =>
    [...processKeys.all, "status", projectId] as const,
  job: (jobId: string) => [...processKeys.all, "job", jobId] as const,
};

/**
 * Hook to start a processing job for a project
 *
 * @example
 * ```typescript
 * const startProcessing = useStartProcessing();
 *
 * const handleProcess = async () => {
 *   const result = await startProcessing.mutateAsync({
 *     projectId: "uuid",
 *     scriptText: "Scene 1: Character walks in...",
 *   });
 *   console.log("Job started:", result.job_id);
 * };
 * ```
 */
export function useStartProcessing() {
  const queryClient = useQueryClient();

  return useMutation<
    ProcessStartResponse,
    AxiosError<ApiError>,
    { projectId: string; scriptText: string }
  >({
    mutationFn: async ({ projectId, scriptText }) => {
      return request.post<ProcessRequest, ProcessStartResponse>(
        `/api/v1/process/${projectId}`,
        { script_text: scriptText },
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate status query to trigger refetch
      void queryClient.invalidateQueries({
        queryKey: processKeys.status(variables.projectId),
      });
    },
  });
}

/**
 * Hook to poll processing status for a project
 *
 * Automatically polls every 30 seconds while status is 'pending' or 'processing'.
 * Stops polling when status is 'complete' or 'error'.
 *
 * @example
 * ```typescript
 * const { data: status, isLoading } = useProcessingStatus(projectId, {
 *   enabled: !!projectId && isProcessing,
 * });
 *
 * if (status?.status === "complete") {
 *   console.log("Video ready:", status.video_url);
 * }
 * ```
 */
export function useProcessingStatus(
  projectId: string | null,
  options?: {
    enabled?: boolean;
    onSuccess?: (data: ProcessStatusResponse) => void;
    onError?: (error: AxiosError<ApiError>) => void;
  },
) {
  return useQuery<ProcessStatusResponse, AxiosError<ApiError>>({
    queryKey: processKeys.status(projectId ?? ""),
    queryFn: () =>
      request.get<undefined, ProcessStatusResponse>(
        `/api/v1/process/${projectId}/status`,
      ),
    enabled: !!projectId && (options?.enabled ?? true),
    // Poll every 30 seconds while processing
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "pending" || data?.status === "processing") {
        return 30000; // 30 seconds
      }
      return false; // Stop polling
    },
    // Keep previous data while refetching
    placeholderData: (previousData) => previousData,
    // Don't retry on 404 (no job exists yet)
    retry: (failureCount, error) => {
      if (error.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to get status of a specific job by ID
 *
 * @example
 * ```typescript
 * const { data: job } = useJobStatus(jobId);
 * ```
 */
export function useJobStatus(
  jobId: string | null,
  options?: {
    enabled?: boolean;
  },
) {
  return useQuery<ProcessStatusResponse, AxiosError<ApiError>>({
    queryKey: processKeys.job(jobId ?? ""),
    queryFn: () =>
      request.get<undefined, ProcessStatusResponse>(
        `/api/v1/process/job/${jobId}`,
      ),
    enabled: !!jobId && (options?.enabled ?? true),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "pending" || data?.status === "processing") {
        return 30000;
      }
      return false;
    },
    placeholderData: (previousData) => previousData,
  });
}
