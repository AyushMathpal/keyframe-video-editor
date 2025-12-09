/**
 * API Hooks
 *
 * Export all React Query hooks for the backend API.
 */

// Base query/mutation utilities
export {
  useApiQuery,
  useApiMutation,
  useApiPutMutation,
  useApiDeleteMutation,
  useQueryClient,
  type ApiError,
} from "./useApiQuery";

// Feature-specific hooks
export { useHealthCheck, type HealthCheckResponse } from "./useHealth";

// Upload hooks
export {
  useChunkedUpload,
  useMultiFileUpload,
  type UploadProgress,
  type FileToUpload,
} from "./useUpload";

// User hooks
export {
  useRegisterUser,
  useCreateProject,
  type RegisterPayload,
  type UserResponse,
  type ProjectPayload,
  type ProjectResponse,
} from "./useUsers";

// Processing hooks
export {
  useStartProcessing,
  useProcessingStatus,
  useJobStatus,
  processKeys,
  type ProcessRequest,
  type ProcessStartResponse,
  type ProcessStatusResponse,
} from "./useProcess";
