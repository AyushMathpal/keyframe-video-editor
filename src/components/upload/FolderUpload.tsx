"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useAtomValue } from "jotai";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/Button";
import { useChunkedUpload } from "~/api/hooks/useUpload";
import { useCreateProject } from "~/api/hooks/useUsers";
import { userAtom } from "~/store/user";

export interface FileItem {
  name: string;
  path: string;
  size: number;
  type: string;
  file: File; // Keep reference to actual file for upload
}

interface FolderUploadProps {
  onFilesSelect: (files: FileItem[]) => void;
  onUploadComplete?: (uploadedPaths: string[], projectId: string) => void;
  disabled?: boolean;
}

export function FolderUpload({
  onFilesSelect,
  onUploadComplete,
  disabled = false,
}: FolderUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [uploadedPaths, setUploadedPaths] = useState<string[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isCancelledRef = useRef(false);

  const user = useAtomValue(userAtom);

  const { progress, uploadFile, cancelUpload, resetProgress } =
    useChunkedUpload();

  const createProjectMutation = useCreateProject();

  // Filter to only video files for uploading
  const videoFiles = useMemo(
    () => selectedFiles.filter((f) => f.type.startsWith("video/")),
    [selectedFiles],
  );

  const isUploading =
    progress.status === "uploading" ||
    progress.status === "initializing" ||
    progress.status === "completing";

  const processFiles = useCallback(
    (fileList: FileList) => {
      const files: FileItem[] = Array.from(fileList).map((file) => ({
        name: file.name,
        path: file.webkitRelativePath || file.name,
        size: file.size,
        type: file.type,
        file: file,
      }));

      setSelectedFiles(files);
      setUploadedPaths([]);
      setCurrentFileIndex(0);
      resetProgress();
      onFilesSelect(files);
    },
    [onFilesSelect, resetProgress],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const items = e.dataTransfer.items;
      if (!items) return;

      const files: FileItem[] = Array.from(items)
        .filter((item) => item.kind === "file")
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null)
        .map((file) => ({
          name: file.name,
          path: file.webkitRelativePath || file.name,
          size: file.size,
          type: file.type,
          file: file,
        }));

      if (files.length > 0) {
        setSelectedFiles(files);
        setUploadedPaths([]);
        setCurrentFileIndex(0);
        resetProgress();
        onFilesSelect(files);
      }
    },
    [onFilesSelect, resetProgress],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
      }
    },
    [processFiles],
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleStartUpload = useCallback(async () => {
    if (videoFiles.length === 0) return;
    if (!user?.id) {
      console.error("User not logged in");
      return;
    }

    // Reset cancellation flag at start
    isCancelledRef.current = false;

    // Create a project for this upload session
    let currentProjectId = projectId;
    if (!currentProjectId) {
      try {
        // Use folder name or timestamp as project name
        const folderName =
          selectedFiles[0]?.path.split("/")[0] ??
          `Upload ${new Date().toISOString()}`;
        const project = await createProjectMutation.mutateAsync({
          user_id: user.id,
          name: folderName,
        });
        currentProjectId = project.id;
        setProjectId(currentProjectId);
      } catch (error) {
        console.error("Failed to create project:", error);
        return;
      }
    }

    const paths: string[] = [];

    for (const [index, fileItem] of videoFiles.entries()) {
      // Check cancellation via ref (not stale closure)
      if (isCancelledRef.current) {
        break;
      }

      setCurrentFileIndex(index);

      const filePath = await uploadFile(fileItem.file, currentProjectId);

      if (filePath) {
        paths.push(filePath);
        setUploadedPaths([...paths]);
      } else if (isCancelledRef.current) {
        // Upload returned null due to cancellation
        break;
      }
    }

    if (paths.length > 0 && currentProjectId) {
      onUploadComplete?.(paths, currentProjectId);
    }
  }, [
    videoFiles,
    uploadFile,
    onUploadComplete,
    user?.id,
    projectId,
    selectedFiles,
    createProjectMutation,
  ]);

  const handleClearSelection = useCallback(() => {
    setSelectedFiles([]);
    setUploadedPaths([]);
    setCurrentFileIndex(0);
    setProjectId(null);
    isCancelledRef.current = false;
    resetProgress();
  }, [resetProgress]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
  const audioFiles = selectedFiles.filter((f) => f.type.startsWith("audio/"));
  const imageFiles = selectedFiles.filter((f) => f.type.startsWith("image/"));
  const otherFiles = selectedFiles.filter(
    (f) =>
      !f.type.startsWith("video/") &&
      !f.type.startsWith("audio/") &&
      !f.type.startsWith("image/"),
  );

  // Calculate overall progress for multi-file upload
  const overallProgress = useMemo(() => {
    if (videoFiles.length === 0) return 0;
    const completedFiles = uploadedPaths.length;
    const currentProgress = progress.percentage || 0;
    return Math.round(
      ((completedFiles + currentProgress / 100) / videoFiles.length) * 100,
    );
  }, [videoFiles.length, uploadedPaths.length, progress.percentage]);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onClick={disabled || isUploading ? undefined : handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={disabled || isUploading ? undefined : handleDrop}
        className={cn(
          "relative flex min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all duration-200",
          "cursor-pointer",
          isDragging && !disabled && !isUploading
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-muted-foreground/50 hover:bg-accent/30",
          disabled || isUploading
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer",
          selectedFiles.length > 0 &&
            !isUploading &&
            "border-success/50 bg-success/5",
          progress.status === "complete" && "border-success bg-success/10",
        )}
      >
        {/* Background Pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="32"
                height="32"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 32 0 L 0 0 0 32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Icon */}
        <div
          className={cn(
            "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
            isDragging
              ? "bg-primary/20 scale-110"
              : progress.status === "complete"
                ? "bg-success/20"
                : selectedFiles.length > 0
                  ? "bg-success/20"
                  : "bg-muted",
          )}
        >
          {isUploading ? (
            <svg
              className="text-primary h-8 w-8 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : progress.status === "complete" || selectedFiles.length > 0 ? (
            <svg
              className="text-success h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className={cn(
                "h-8 w-8 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground",
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 11v6m0 0l-2-2m2 2l2-2"
              />
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="text-center">
          {isUploading ? (
            <>
              <p className="text-subtitle text-foreground mb-1">
                Uploading {currentFileIndex + 1} of {videoFiles.length}...
              </p>
              <p className="text-body-sm text-muted-foreground mb-2">
                {progress.filename}
              </p>
              {/* Progress Bar */}
              <div className="mx-auto w-64">
                <div className="bg-muted mb-2 h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <div className="text-muted-foreground flex justify-between text-xs">
                  <span>
                    {formatBytes(progress.uploadedSize)} /{" "}
                    {formatBytes(progress.totalSize)}
                  </span>
                  <span>{progress.percentage}%</span>
                </div>
                {videoFiles.length > 1 && (
                  <div className="text-muted-foreground mt-2 text-xs">
                    Overall: {overallProgress}%
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  isCancelledRef.current = true;
                  void cancelUpload();
                }}
                className="text-destructive hover:text-destructive mt-3"
              >
                Cancel Upload
              </Button>
            </>
          ) : progress.status === "complete" ? (
            <>
              <p className="text-subtitle text-success mb-1">
                Upload Complete!
              </p>
              <p className="text-body-sm text-muted-foreground">
                {uploadedPaths.length} video
                {uploadedPaths.length !== 1 ? "s" : ""} uploaded successfully
              </p>
            </>
          ) : progress.status === "error" ? (
            <>
              <p className="text-subtitle text-destructive mb-1">
                Upload Failed
              </p>
              <p className="text-body-sm text-muted-foreground">
                {progress.error}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  resetProgress();
                }}
                className="mt-2"
              >
                Try Again
              </Button>
            </>
          ) : selectedFiles.length > 0 ? (
            <>
              <p className="text-subtitle text-success mb-1">
                {selectedFiles.length} files selected
              </p>
              <p className="text-body-sm text-muted-foreground">
                Total size: {formatBytes(totalSize)}
              </p>
            </>
          ) : (
            <>
              <p className="text-subtitle text-foreground mb-1">
                {isDragging
                  ? "Drop your folder here"
                  : "Drop folder or click to browse"}
              </p>
              <p className="text-body-sm text-muted-foreground">
                Select a project folder containing your video, audio, and image
                files
              </p>
            </>
          )}
        </div>

        {/* Hidden Input */}
        <input
          ref={inputRef}
          type="file"
          onChange={handleInputChange}
          className="hidden"
          /* @ts-expect-error - webkitdirectory is not in the types */
          webkitdirectory="true"
          directory="true"
          multiple
          disabled={disabled || isUploading}
        />
      </div>

      {/* File Summary */}
      {selectedFiles.length > 0 &&
        !isUploading &&
        progress.status !== "complete" && (
          <div className="animate-in fade-in slide-in-from-bottom border-border bg-card/50 space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-subtitle text-foreground">
                Project Contents
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearSelection();
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Video Files */}
              <div className="bg-accent/50 flex items-center gap-2 rounded-md p-2">
                <div className="bg-chart-1/20 flex h-8 w-8 items-center justify-center rounded-md">
                  <svg
                    className="text-chart-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">Video</p>
                  <p className="text-body-sm text-foreground font-medium">
                    {videoFiles.length}
                  </p>
                </div>
              </div>

              {/* Audio Files */}
              <div className="bg-accent/50 flex items-center gap-2 rounded-md p-2">
                <div className="bg-chart-2/20 flex h-8 w-8 items-center justify-center rounded-md">
                  <svg
                    className="text-chart-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">Audio</p>
                  <p className="text-body-sm text-foreground font-medium">
                    {audioFiles.length}
                  </p>
                </div>
              </div>

              {/* Image Files */}
              <div className="bg-accent/50 flex items-center gap-2 rounded-md p-2">
                <div className="bg-chart-3/20 flex h-8 w-8 items-center justify-center rounded-md">
                  <svg
                    className="text-chart-3 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">Images</p>
                  <p className="text-body-sm text-foreground font-medium">
                    {imageFiles.length}
                  </p>
                </div>
              </div>

              {/* Other Files */}
              <div className="bg-accent/50 flex items-center gap-2 rounded-md p-2">
                <div className="bg-chart-4/20 flex h-8 w-8 items-center justify-center rounded-md">
                  <svg
                    className="text-chart-4 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-caption text-muted-foreground">Other</p>
                  <p className="text-body-sm text-foreground font-medium">
                    {otherFiles.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Button */}
            {videoFiles.length > 0 && (
              <div className="pt-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleStartUpload();
                  }}
                  className="w-full"
                  disabled={isUploading}
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Upload {videoFiles.length} Video
                  {videoFiles.length !== 1 ? "s" : ""}
                </Button>
                <p className="text-caption text-muted-foreground mt-2 text-center">
                  Only video files will be uploaded to the server
                </p>
              </div>
            )}
          </div>
        )}

      {/* Upload Complete Summary */}
      {progress.status === "complete" && uploadedPaths.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom border-success/30 bg-success/5 space-y-2 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <svg
              className="text-success h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-subtitle text-success">
              {uploadedPaths.length} file{uploadedPaths.length !== 1 ? "s" : ""}{" "}
              uploaded successfully
            </span>
          </div>
          <p className="text-body-sm text-muted-foreground">
            Your videos are ready for AI processing
          </p>
        </div>
      )}
    </div>
  );
}
