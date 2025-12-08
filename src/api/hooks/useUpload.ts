"use client";

import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { getFullEndpoint } from "~/lib/request";
const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB chunks

interface ApiErrorResponse {
  detail?: string;
}

/**
 * Extract error message from various error types
 */
function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detail ?? error.message ?? "Upload failed";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Upload failed";
}

export interface UploadProgress {
  uploadId: string | null;
  filename: string;
  totalSize: number;
  uploadedSize: number;
  percentage: number;
  chunksTotal: number;
  chunksUploaded: number;
  status:
    | "idle"
    | "initializing"
    | "uploading"
    | "completing"
    | "complete"
    | "error"
    | "cancelled";
  error: string | null;
  filePath: string | null;
}

export interface FileToUpload {
  file: File;
  relativePath: string;
}

interface UploadInitResponse {
  upload_id: string;
  chunk_size: number;
  message: string;
}

interface UploadChunkResponse {
  upload_id: string;
  chunk_index: number;
  chunks_received: number;
  total_chunks: number;
  is_complete: boolean;
  message: string;
}

interface UploadCompleteResponse {
  upload_id: string;
  filename: string;
  file_path: string;
  total_size: number;
  message: string;
}

interface UploadStatusResponse {
  upload_id: string;
  filename: string;
  total_size: number;
  total_chunks: number;
  chunks_received: number[];
  is_complete: boolean;
  file_path: string | null;
}

interface UseChunkedUploadOptions {
  projectId: string;
}

export function useChunkedUpload(options?: UseChunkedUploadOptions) {
  const [progress, setProgress] = useState<UploadProgress>({
    uploadId: null,
    filename: "",
    totalSize: 0,
    uploadedSize: 0,
    percentage: 0,
    chunksTotal: 0,
    chunksUploaded: 0,
    status: "idle",
    error: null,
    filePath: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isUploadingRef = useRef(false);
  const projectIdRef = useRef<string | null>(options?.projectId ?? null);

  // Allow updating projectId after hook initialization
  const setProjectId = useCallback((id: string) => {
    projectIdRef.current = id;
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({
      uploadId: null,
      filename: "",
      totalSize: 0,
      uploadedSize: 0,
      percentage: 0,
      chunksTotal: 0,
      chunksUploaded: 0,
      status: "idle",
      error: null,
      filePath: null,
    });
  }, []);

  const uploadFile = useCallback(
    async (file: File, projectId?: string): Promise<string | null> => {
      const effectiveProjectId = projectId ?? projectIdRef.current;
      if (!effectiveProjectId) {
        console.error("No projectId provided for upload");
        setProgress((prev) => ({
          ...prev,
          status: "error",
          error: "No project ID provided",
        }));
        return null;
      }
      if (isUploadingRef.current) {
        console.warn("Upload already in progress");
        return null;
      }

      isUploadingRef.current = true;
      abortControllerRef.current = new AbortController();

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      setProgress({
        uploadId: null,
        filename: file.name,
        totalSize: file.size,
        uploadedSize: 0,
        percentage: 0,
        chunksTotal: totalChunks,
        chunksUploaded: 0,
        status: "initializing",
        error: null,
        filePath: null,
      });

      try {
        // Step 1: Initialize upload session
        const initFormData = new FormData();
        initFormData.append("filename", file.name);
        initFormData.append("total_size", file.size.toString());
        initFormData.append("total_chunks", totalChunks.toString());
        initFormData.append("project_id", effectiveProjectId);
        initFormData.append("content_type", file.type || "video/mp4");

        const initResponse = await axios.post<UploadInitResponse>(
          getFullEndpoint("/api/v1/upload/init"),
          initFormData,
          { signal: abortControllerRef.current.signal },
        );

        const uploadId = initResponse.data.upload_id;

        setProgress((prev) => ({
          ...prev,
          uploadId,
          status: "uploading",
        }));

        // Step 2: Upload chunks sequentially
        const chunkIndices = Array.from({ length: totalChunks }, (_, i) => i);

        for (const chunkIndex of chunkIndices) {
          // Check if cancelled
          if (abortControllerRef.current?.signal.aborted) {
            throw new Error("Upload cancelled");
          }

          const start = chunkIndex * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          const chunkFormData = new FormData();
          chunkFormData.append("chunk_index", chunkIndex.toString());
          chunkFormData.append("chunk", chunk, `chunk_${chunkIndex}`);

          await axios.post<UploadChunkResponse>(
            getFullEndpoint(`/api/v1/upload/chunk/${uploadId}`),
            chunkFormData,
            {
              signal: abortControllerRef.current.signal,
            },
          );

          const uploadedSize = end;
          const percentage = Math.round((uploadedSize / file.size) * 100);

          setProgress((prev) => ({
            ...prev,
            uploadedSize,
            percentage,
            chunksUploaded: chunkIndex + 1,
          }));
        }

        // Step 3: Complete upload
        setProgress((prev) => ({
          ...prev,
          status: "completing",
        }));

        const completeResponse = await axios.post<UploadCompleteResponse>(
          getFullEndpoint(`/api/v1/upload/complete/${uploadId}`),
          {},
          { signal: abortControllerRef.current.signal },
        );

        setProgress((prev) => ({
          ...prev,
          status: "complete",
          percentage: 100,
          filePath: completeResponse.data.file_path,
        }));

        isUploadingRef.current = false;
        return completeResponse.data.file_path;
      } catch (error) {
        isUploadingRef.current = false;

        if (
          axios.isCancel(error) ||
          (error instanceof Error && error.message === "Upload cancelled")
        ) {
          setProgress((prev) => ({
            ...prev,
            status: "cancelled",
            error: "Upload cancelled",
          }));
          return null;
        }

        const errorMessage = getErrorMessage(error);

        setProgress((prev) => ({
          ...prev,
          status: "error",
          error: errorMessage,
        }));

        return null;
      }
    },
    [],
  );

  const cancelUpload = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Also cancel on server if we have an upload ID
    const uploadId = progress.uploadId;
    if (uploadId) {
      try {
        await axios.delete(getFullEndpoint(`/api/v1/upload/${uploadId}`));
      } catch (error) {
        console.error("Failed to cancel upload on server:", error);
      }
    }

    isUploadingRef.current = false;
  }, [progress.uploadId]);

  const resumeUpload = useCallback(
    async (uploadId: string, file: File): Promise<string | null> => {
      if (isUploadingRef.current) {
        console.warn("Upload already in progress");
        return null;
      }

      isUploadingRef.current = true;
      abortControllerRef.current = new AbortController();

      try {
        // Get current status
        const statusResponse = await axios.get<UploadStatusResponse>(
          getFullEndpoint(`/api/v1/upload/status/${uploadId}`),
          { signal: abortControllerRef.current.signal },
        );

        const status = statusResponse.data;

        if (status.is_complete) {
          setProgress({
            uploadId,
            filename: status.filename,
            totalSize: status.total_size,
            uploadedSize: status.total_size,
            percentage: 100,
            chunksTotal: status.total_chunks,
            chunksUploaded: status.total_chunks,
            status: "complete",
            error: null,
            filePath: status.file_path,
          });
          isUploadingRef.current = false;
          return status.file_path;
        }

        const receivedChunks = new Set(status.chunks_received);
        const totalChunks = status.total_chunks;

        setProgress({
          uploadId,
          filename: status.filename,
          totalSize: status.total_size,
          uploadedSize: receivedChunks.size * CHUNK_SIZE,
          percentage: Math.round((receivedChunks.size / totalChunks) * 100),
          chunksTotal: totalChunks,
          chunksUploaded: receivedChunks.size,
          status: "uploading",
          error: null,
          filePath: null,
        });

        // Upload missing chunks sequentially
        const chunkIndices = Array.from({ length: totalChunks }, (_, i) => i);
        const missingChunks = chunkIndices.filter(
          (idx) => !receivedChunks.has(idx),
        );

        for (const chunkIndex of missingChunks) {
          if (abortControllerRef.current?.signal.aborted) {
            throw new Error("Upload cancelled");
          }

          const start = chunkIndex * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          const chunkFormData = new FormData();
          chunkFormData.append("chunk_index", chunkIndex.toString());
          chunkFormData.append("chunk", chunk, `chunk_${chunkIndex}`);

          await axios.post<UploadChunkResponse>(
            getFullEndpoint(`/api/v1/upload/chunk/${uploadId}`),
            chunkFormData,
            {
              signal: abortControllerRef.current.signal,
            },
          );

          receivedChunks.add(chunkIndex);

          const uploadedSize = receivedChunks.size * CHUNK_SIZE;
          const percentage = Math.round(
            (receivedChunks.size / totalChunks) * 100,
          );

          setProgress((prev) => ({
            ...prev,
            uploadedSize: Math.min(uploadedSize, file.size),
            percentage,
            chunksUploaded: receivedChunks.size,
          }));
        }

        // Complete upload
        setProgress((prev) => ({
          ...prev,
          status: "completing",
        }));

        const completeResponse = await axios.post<UploadCompleteResponse>(
          getFullEndpoint(`/api/v1/upload/complete/${uploadId}`),
          {},
          { signal: abortControllerRef.current.signal },
        );

        setProgress((prev) => ({
          ...prev,
          status: "complete",
          percentage: 100,
          filePath: completeResponse.data.file_path,
        }));

        isUploadingRef.current = false;
        return completeResponse.data.file_path;
      } catch (error) {
        isUploadingRef.current = false;

        if (
          axios.isCancel(error) ||
          (error instanceof Error && error.message === "Upload cancelled")
        ) {
          setProgress((prev) => ({
            ...prev,
            status: "cancelled",
            error: "Upload cancelled",
          }));
          return null;
        }

        const errorMessage = getErrorMessage(error);

        setProgress((prev) => ({
          ...prev,
          status: "error",
          error: errorMessage,
        }));

        return null;
      }
    },
    [],
  );

  return {
    progress,
    uploadFile,
    cancelUpload,
    resumeUpload,
    resetProgress,
    setProjectId,
    isUploading:
      isUploadingRef.current ||
      progress.status === "uploading" ||
      progress.status === "completing",
  };
}

/**
 * Hook for uploading multiple files (e.g., a folder of videos)
 */
export function useMultiFileUpload() {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(
    new Map(),
  );
  const [overallProgress, setOverallProgress] = useState({
    totalFiles: 0,
    completedFiles: 0,
    percentage: 0,
    status: "idle" as "idle" | "uploading" | "complete" | "error",
  });

  const uploadFiles = useCallback(async (files: File[]): Promise<string[]> => {
    const filePaths: string[] = [];

    setOverallProgress({
      totalFiles: files.length,
      completedFiles: 0,
      percentage: 0,
      status: "uploading",
    });

    for (const file of files) {
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      // Initialize progress for this file
      setUploads((prev) => {
        const newMap = new Map(prev);
        newMap.set(file.name, {
          uploadId: null,
          filename: file.name,
          totalSize: file.size,
          uploadedSize: 0,
          percentage: 0,
          chunksTotal: totalChunks,
          chunksUploaded: 0,
          status: "initializing",
          error: null,
          filePath: null,
        });
        return newMap;
      });

      try {
        // Initialize upload
        const initFormData = new FormData();
        initFormData.append("filename", file.name);
        initFormData.append("total_size", file.size.toString());
        initFormData.append("total_chunks", totalChunks.toString());
        initFormData.append("content_type", file.type || "video/mp4");

        const initResponse = await axios.post<UploadInitResponse>(
          getFullEndpoint("/api/v1/upload/init"),
          initFormData,
        );

        const uploadId = initResponse.data.upload_id;

        setUploads((prev) => {
          const newMap = new Map(prev);
          const current = newMap.get(file.name);
          if (current) {
            newMap.set(file.name, {
              ...current,
              uploadId,
              status: "uploading",
            });
          }
          return newMap;
        });

        // Upload chunks sequentially
        const chunkIndices = Array.from({ length: totalChunks }, (_, i) => i);

        for (const chunkIndex of chunkIndices) {
          const start = chunkIndex * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          const chunkFormData = new FormData();
          chunkFormData.append("chunk_index", chunkIndex.toString());
          chunkFormData.append("chunk", chunk, `chunk_${chunkIndex}`);

          await axios.post(
            getFullEndpoint(`/api/v1/upload/chunk/${uploadId}`),
            chunkFormData,
          );

          setUploads((prev) => {
            const newMap = new Map(prev);
            const current = newMap.get(file.name);
            if (current) {
              const uploadedSize = end;
              const percentage = Math.round((uploadedSize / file.size) * 100);
              newMap.set(file.name, {
                ...current,
                uploadedSize,
                percentage,
                chunksUploaded: chunkIndex + 1,
              });
            }
            return newMap;
          });
        }

        // Complete upload
        const completeResponse = await axios.post<UploadCompleteResponse>(
          getFullEndpoint(`/api/v1/upload/complete/${uploadId}`),
          {},
        );

        setUploads((prev) => {
          const newMap = new Map(prev);
          const current = newMap.get(file.name);
          if (current) {
            newMap.set(file.name, {
              ...current,
              status: "complete",
              percentage: 100,
              filePath: completeResponse.data.file_path,
            });
          }
          return newMap;
        });

        filePaths.push(completeResponse.data.file_path);

        setOverallProgress((prev) => ({
          ...prev,
          completedFiles: prev.completedFiles + 1,
          percentage: Math.round(
            ((prev.completedFiles + 1) / files.length) * 100,
          ),
        }));
      } catch (error) {
        const errorMessage = getErrorMessage(error);

        setUploads((prev) => {
          const newMap = new Map(prev);
          const current = newMap.get(file.name);
          if (current) {
            newMap.set(file.name, {
              ...current,
              status: "error",
              error: errorMessage,
            });
          }
          return newMap;
        });
      }
    }

    setOverallProgress((prev) => ({
      ...prev,
      status: prev.completedFiles === files.length ? "complete" : "error",
    }));

    return filePaths;
  }, []);

  const reset = useCallback(() => {
    setUploads(new Map());
    setOverallProgress({
      totalFiles: 0,
      completedFiles: 0,
      percentage: 0,
      status: "idle",
    });
  }, []);

  return {
    uploads,
    overallProgress,
    uploadFiles,
    reset,
  };
}
