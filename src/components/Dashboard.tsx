"use client";

import { useState, useCallback, useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import { userAtom, logoutAtom } from "~/store/user";
import {
  FolderUpload,
  OutputDisplay,
  type FileItem,
} from "~/components/upload";
import { Button } from "~/components/ui/Button";
import { useStartProcessing, useProcessingStatus } from "~/api/hooks";
import { Zap, Sparkles, LogOut, User, FileText } from "lucide-react";

interface OutputFile {
  id: string;
  name: string;
  type: "xml" | "video";
  size?: number;
  downloadUrl?: string;
  previewUrl?: string;
  duration?: string;
}

type ProcessingState =
  | "idle"
  | "uploading"
  | "processing"
  | "complete"
  | "error";

export function Dashboard() {
  const [user] = useAtom(userAtom);
  const logout = useSetAtom(logoutAtom);

  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [uploadedPaths, setUploadedPaths] = useState<string[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [scriptText, setScriptText] = useState("");
  const [outputFiles, setOutputFiles] = useState<OutputFile[]>([]);
  const [processingState, setProcessingState] =
    useState<ProcessingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Processing hooks
  const startProcessingMutation = useStartProcessing();
  const { data: processingStatus } = useProcessingStatus(projectId, {
    enabled: !!projectId && processingState === "processing",
  });

  // Handle processing status updates
  useEffect(() => {
    if (!processingStatus) return;

    if (processingStatus.status === "complete") {
      setProcessingState("complete");

      // Build output files from response using download endpoints
      const apiHost =
        process.env.NEXT_PUBLIC_API_HOST ?? "http://localhost:8000";
      const currentProjectId = processingStatus.project_id;
      const files: OutputFile[] = [];

      if (processingStatus.video_url) {
        const previewUrl = `${apiHost}${processingStatus.video_url}`;
        files.push({
          id: "video",
          name: "final_edit.mp4",
          type: "video",
          size: processingStatus.video_size ?? undefined,
          downloadUrl: `${apiHost}/api/v1/process/${currentProjectId}/download/video`,
          previewUrl,
        });
      }

      if (processingStatus.xml_url) {
        files.push({
          id: "xml",
          name: "generated_edit_sequence.xml",
          type: "xml",
          size: processingStatus.xml_size ?? undefined,
          downloadUrl: `${apiHost}/api/v1/process/${currentProjectId}/download/xml`,
        });
      }

      setOutputFiles(files);
    } else if (processingStatus.status === "error") {
      setProcessingState("error");
      setErrorMessage(processingStatus.error_message ?? "Processing failed");
    }
  }, [processingStatus]);

  const handleFilesSelect = useCallback((files: FileItem[]) => {
    setSelectedFiles(files);
    setUploadedPaths([]);
    setProjectId(null);
    setProcessingState("idle");
    setOutputFiles([]);
    setErrorMessage(null);
  }, []);

  const handleUploadComplete = useCallback(
    (paths: string[], newProjectId: string) => {
      setUploadedPaths(paths);
      setProjectId(newProjectId);
      console.log(
        "Upload complete. Project ID:",
        newProjectId,
        "Files:",
        paths,
      );
    },
    [],
  );

  const handleProcess = useCallback(async () => {
    if (uploadedPaths.length === 0 || !projectId) return;
    if (!scriptText.trim()) {
      setErrorMessage("Please enter a script before processing");
      return;
    }

    setProcessingState("processing");
    setErrorMessage(null);

    try {
      await startProcessingMutation.mutateAsync({
        projectId,
        scriptText: scriptText.trim(),
      });
      // Processing started - status will be polled automatically
    } catch (error: unknown) {
      setProcessingState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to start processing",
      );
    }
  }, [uploadedPaths, projectId, scriptText, startProcessingMutation]);

  const handleDownload = useCallback((file: OutputFile) => {
    if (file.downloadUrl) {
      window.open(file.downloadUrl, "_blank");
    }
  }, []);

  const handleDownloadAll = useCallback(() => {
    outputFiles.forEach((file) => {
      if (file.downloadUrl) {
        window.open(file.downloadUrl, "_blank");
      }
    });
  }, [outputFiles]);

  const handleReset = useCallback(() => {
    setSelectedFiles([]);
    setUploadedPaths([]);
    setProjectId(null);
    setScriptText("");
    setOutputFiles([]);
    setProcessingState("idle");
    setErrorMessage(null);
  }, []);

  if (!user) return null;

  const hasUploadedFiles = uploadedPaths.length > 0;
  const hasScript = scriptText.trim().length > 0;
  const canProcess =
    hasUploadedFiles && hasScript && processingState === "idle";

  return (
    <div className="bg-background min-h-screen">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-30">
        <div className="from-primary/5 absolute inset-0 bg-linear-to-b via-transparent to-transparent" />
        <div className="from-primary/10 absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] via-transparent to-transparent" />
      </div>

      {/* Header */}
      <header className="border-border/50 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Zap className="text-primary-foreground h-4 w-4" />
            </div>
            <span className="text-title font-semibold">Keyframe</span>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="text-body-sm text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{user.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="mr-1.5 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Title Section */}
        <div className="mb-10 text-center">
          <div className="animate-in fade-in slide-in-from-bottom border-primary/20 bg-primary/10 mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5">
            <Sparkles className="text-primary h-4 w-4" />
            <span className="text-body-sm text-primary font-medium">
              AI-Powered Video Editing
            </span>
          </div>
          <h1 className="animate-in fade-in slide-in-from-bottom text-headline text-foreground mb-3 delay-75">
            Transform Your Media
          </h1>
          <p className="animate-in fade-in slide-in-from-bottom text-body text-muted-foreground mx-auto max-w-lg delay-100">
            Upload your project folder and let our AI create professionally
            edited timelines for Final Cut Pro and Premiere Pro
          </p>
        </div>

        {/* Workflow Container */}
        <div className="animate-in fade-in slide-in-from-bottom space-y-8 delay-150">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4">
            <StepIndicator
              step={1}
              label="Upload"
              isActive={!hasUploadedFiles && processingState === "idle"}
              isComplete={hasUploadedFiles}
            />
            <div className="bg-border h-px w-12" />
            <StepIndicator
              step={2}
              label="Process"
              isActive={processingState === "processing"}
              isComplete={processingState === "complete"}
            />
            <div className="bg-border h-px w-12" />
            <StepIndicator
              step={3}
              label="Export"
              isActive={false}
              isComplete={processingState === "complete"}
            />
          </div>

          {/* Main Content Area */}
          <div className="border-border bg-card/50 rounded-2xl border p-6 backdrop-blur-sm">
            {processingState === "idle" ||
            processingState === "complete" ||
            processingState === "error" ? (
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-title text-foreground">
                      Project Folder
                    </h2>
                    {selectedFiles.length > 0 &&
                      processingState === "complete" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleReset}
                          className="text-muted-foreground"
                        >
                          <svg
                            className="mr-1.5 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Start Over
                        </Button>
                      )}
                  </div>
                  <FolderUpload
                    onFilesSelect={handleFilesSelect}
                    onUploadComplete={handleUploadComplete}
                    disabled={processingState === "complete"}
                  />
                </div>

                {/* Output Section */}
                <div className="space-y-4">
                  <h2 className="text-title text-foreground">Export Files</h2>
                  <OutputDisplay
                    files={outputFiles}
                    onDownload={handleDownload}
                    onDownloadAll={handleDownloadAll}
                  />
                </div>
              </div>
            ) : (
              <OutputDisplay
                files={[]}
                isProcessing={true}
                progress={processingStatus?.status === "processing" ? 50 : 10}
              />
            )}
          </div>

          {/* Script Input Section - Show when files are uploaded */}
          {hasUploadedFiles && processingState !== "complete" && (
            <div className="animate-in fade-in slide-in-from-bottom border-border bg-card/50 rounded-2xl border p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="text-primary h-5 w-5" />
                <h2 className="text-title text-foreground">
                  Script / Screenplay
                </h2>
              </div>
              <p className="text-body-sm text-muted-foreground mb-4">
                Paste your script below. The AI will use this to sync with your
                video footage and create an optimized edit.
              </p>
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="INT. LIVING ROOM - DAY

Character enters the room and looks around...

CHARACTER
(nervously)
Hello? Is anyone here?

..."
                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/50 focus:border-primary h-48 w-full resize-y rounded-lg border px-4 py-3 font-mono text-sm focus:ring-2 focus:outline-none"
                disabled={processingState === "processing"}
              />
              <p className="text-caption text-muted-foreground mt-2">
                {scriptText.length} characters
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="animate-in fade-in slide-in-from-bottom border-destructive/30 bg-destructive/10 rounded-lg border p-4">
              <p className="text-body-sm text-destructive">{errorMessage}</p>
            </div>
          )}

          {/* Action Button */}
          {canProcess && (
            <div className="animate-in fade-in slide-in-from-bottom flex justify-center">
              <Button
                size="lg"
                onClick={handleProcess}
                className="gap-2 px-8"
                disabled={startProcessingMutation.isPending}
              >
                <Sparkles className="h-4 w-4" />
                {startProcessingMutation.isPending
                  ? "Starting..."
                  : "Process with AI"}
              </Button>
            </div>
          )}

          {/* Processing Message */}
          {processingState === "processing" && (
            <div className="animate-in fade-in slide-in-from-bottom text-center">
              <p className="text-body-sm text-muted-foreground">
                Processing your videos... This may take several minutes.
              </p>
              <p className="text-caption text-muted-foreground mt-1">
                Status updates every 30 seconds
              </p>
            </div>
          )}

          {processingState === "complete" && (
            <div className="animate-in fade-in slide-in-from-bottom text-center">
              <p className="text-body-sm text-success mb-4">
                ✓ Your export files are ready for download
              </p>
              <Button variant="outline" onClick={handleReset}>
                Process Another Project
              </Button>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="animate-in fade-in slide-in-from-bottom mt-16 delay-200">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                    />
                  </svg>
                ),
                title: "Lightning Fast",
                description:
                  "Process hours of footage in minutes with our optimized AI pipeline",
              },
              {
                icon: (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                ),
                title: "Universal Export",
                description:
                  "Export to Final Cut Pro XML and Premiere Pro compatible formats",
              },
              {
                icon: (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                    />
                  </svg>
                ),
                title: "Smart Editing",
                description:
                  "AI analyzes your footage to create professional edit decisions",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group border-border/50 bg-card/30 hover:border-border hover:bg-card/50 rounded-xl border p-5 transition-all"
              >
                <div className="text-primary bg-primary/10 group-hover:bg-primary/20 mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-subtitle text-foreground mb-1">
                  {feature.title}
                </h3>
                <p className="text-body-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-border/50 mt-16 border-t py-8">
        <p className="text-caption text-muted-foreground text-center">
          Powered by Keyframe AI · Professional video editing made simple
        </p>
      </footer>
    </div>
  );
}

// Step Indicator Component
function StepIndicator({
  step,
  label,
  isActive,
  isComplete,
}: {
  step: number;
  label: string;
  isActive: boolean;
  isComplete: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
          isComplete
            ? "bg-success text-success-foreground"
            : isActive
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
        }`}
      >
        {isComplete ? (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          step
        )}
      </div>
      <span
        className={`text-body-sm font-medium ${
          isActive || isComplete ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
