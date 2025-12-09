"use client";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/Button";

interface OutputFile {
  id: string;
  name: string;
  type: "xml" | "video";
  size?: number;
  downloadUrl?: string;
  duration?: string; // For video files
  previewUrl?: string;
}

interface OutputDisplayProps {
  files: OutputFile[];
  isProcessing?: boolean;
  progress?: number;
  onDownload?: (file: OutputFile) => void;
  onDownloadAll?: () => void;
}

export function OutputDisplay({
  files,
  isProcessing = false,
  progress = 0,
  onDownload,
  onDownloadAll,
}: OutputDisplayProps) {
  const formatBytes = (bytes?: number) => {
    if (bytes == null) return "Unknown size";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: OutputFile["type"]) => {
    if (type === "video") {
      return (
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
          />
          <rect x="2" y="4" width="20" height="16" rx="3" />
        </svg>
      );
    }
    return (
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <path d="M8 13h2" />
        <path d="M8 17h2" />
        <path d="M14 13h2" />
        <path d="M14 17h2" />
      </svg>
    );
  };

  const getFileColors = (type: OutputFile["type"]) => {
    if (type === "video") {
      return {
        bg: "bg-linear-to-br from-rose-500/20 to-orange-500/20",
        border: "border-rose-500/30",
        icon: "text-rose-400",
        badge: "bg-rose-500/20 text-rose-300",
      };
    }
    return {
      bg: "bg-linear-to-br from-emerald-500/20 to-teal-500/20",
      border: "border-emerald-500/30",
      icon: "text-emerald-400",
      badge: "bg-emerald-500/20 text-emerald-300",
    };
  };

  if (isProcessing) {
    return (
      <div className="border-border bg-card/50 flex flex-col items-center justify-center rounded-xl border p-12">
        {/* Processing Animation */}
        <div className="relative mb-6">
          {/* Outer ring */}
          <div className="border-muted h-20 w-20 rounded-full border-2" />

          {/* Progress ring */}
          <svg
            className="absolute inset-0 h-20 w-20 -rotate-90"
            viewBox="0 0 80 80"
          >
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-chart-1)" />
                <stop offset="100%" stopColor="var(--color-chart-3)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-title text-foreground font-semibold">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Processing Text */}
        <div className="text-center">
          <p className="text-subtitle text-foreground mb-1">
            Processing your media...
          </p>
          <p className="text-body-sm text-muted-foreground">
            Analyzing footage and generating your edit
          </p>
        </div>

        {/* Processing Steps */}
        <div className="mt-6 w-full max-w-xs space-y-2">
          {[
            { label: "Analyzing footage", threshold: 25 },
            { label: "Generating timeline", threshold: 50 },
            { label: "Rendering rough cut", threshold: 75 },
            { label: "Finalizing exports", threshold: 95 },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full transition-all",
                  progress >= step.threshold
                    ? "bg-success text-success-foreground"
                    : progress >= step.threshold - 25
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {progress >= step.threshold ? (
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : progress >= step.threshold - 25 ? (
                  <div className="h-2 w-2 animate-pulse rounded-full bg-current" />
                ) : (
                  <span className="text-2xs">{i + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-body-sm transition-colors",
                  progress >= step.threshold - 25
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="border-border bg-card/30 flex flex-col items-center justify-center rounded-xl border border-dashed p-12">
        <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
          <svg
            className="text-muted-foreground h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <p className="text-subtitle text-muted-foreground mb-1">
          No output files yet
        </p>
        <p className="text-body-sm text-muted-foreground/70">
          Upload a folder and process to generate your rough cut
        </p>
      </div>
    );
  }

  // Separate video and XML files for better layout
  const videoFile = files.find((f) => f.type === "video");
  const xmlFile = files.find((f) => f.type === "xml");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-subtitle text-foreground">Your Edit is Ready</h3>
          <p className="text-caption text-muted-foreground">
            {files.length} files available for download
          </p>
        </div>
        {files.length > 1 && onDownloadAll && (
          <Button variant="outline" size="sm" onClick={onDownloadAll}>
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download All
          </Button>
        )}
      </div>

      {/* Video File - Featured Card */}
      {videoFile && (
        <div
          className={cn(
            "animate-in fade-in slide-in-from-bottom group relative overflow-hidden rounded-xl border p-6 transition-all",
            getFileColors("video").bg,
            getFileColors("video").border,
          )}
        >
          {/* Decorative gradient */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-linear-to-br from-white/10 to-transparent blur-3xl" />

          <div className="relative">
            {/* Video Preview */}
            <div className="mb-4 overflow-hidden rounded-lg bg-black/50">
              {videoFile.previewUrl ? (
                <video
                  controls
                  preload="metadata"
                  className="h-full w-full"
                  src={videoFile.previewUrl}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-black/30">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                      <svg
                        className="h-8 w-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <span className="text-caption text-white/60">
                      {videoFile.duration ?? "Preview"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-black/20 backdrop-blur-sm",
                    getFileColors("video").icon,
                  )}
                >
                  {getFileIcon("video")}
                </div>

                {/* Info */}
                <div>
                  <p className="text-subtitle text-foreground mb-1">
                    {videoFile.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-2xs rounded-md px-2 py-0.5 font-medium tracking-wider uppercase",
                        getFileColors("video").badge,
                      )}
                    >
                      Rough Cut
                    </span>
                    <span className="text-caption text-muted-foreground">
                      {formatBytes(videoFile.size)}
                    </span>
                    {videoFile.duration && (
                      <span className="text-caption text-muted-foreground">
                        • {videoFile.duration}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onDownload?.(videoFile)}
                className="gap-2"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* XML File - Compact Card */}
      {xmlFile && (
        <div
          className={cn(
            "animate-in fade-in slide-in-from-bottom group relative overflow-hidden rounded-xl border p-5 transition-all hover:scale-[1.01]",
            getFileColors("xml").bg,
            getFileColors("xml").border,
          )}
          style={{ animationDelay: "100ms" }}
        >
          {/* Decorative gradient */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-linear-to-br from-white/5 to-transparent blur-2xl" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl bg-black/20 backdrop-blur-sm",
                  getFileColors("xml").icon,
                )}
              >
                {getFileIcon("xml")}
              </div>

              {/* Info */}
              <div>
                <p className="text-subtitle text-foreground mb-1">
                  {xmlFile.name}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-2xs rounded-md px-2 py-0.5 font-medium tracking-wider uppercase",
                      getFileColors("xml").badge,
                    )}
                  >
                    Timeline
                  </span>
                  <span className="text-caption text-muted-foreground">
                    {formatBytes(xmlFile.size)}
                  </span>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload?.(xmlFile)}
              className="h-9 w-9 p-0 opacity-70 transition-opacity hover:opacity-100"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </Button>
          </div>

          {/* Hint */}
          <div className="text-muted-foreground/60 mt-3 flex items-center gap-2 border-t border-white/5 pt-3">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-2xs">
              Import in Premiere Pro or Final Cut Pro for further editing
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
