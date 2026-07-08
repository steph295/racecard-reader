"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useMeetingsList, useSeedDemoMeeting, useUploadMeeting } from "@/lib/hooks/useMeetings";
import styles from "./page.module.css";

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return "Today";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: meetings, isLoading } = useMeetingsList();
  const uploadMutation = useUploadMeeting();
  const seedDemoMutation = useSeedDemoMeeting();

  async function handleFile(file: File) {
    setError(null);
    try {
      const { meetingId } = await uploadMutation.mutateAsync(file);
      router.push(`/meetings/${meetingId}/races/1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  }

  async function handleTryDemo() {
    setError(null);
    try {
      const { meetingId } = await seedDemoMutation.mutateAsync();
      router.push(`/meetings/${meetingId}/races/1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the demo meeting.");
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  const busy = uploadMutation.isPending || seedDemoMutation.isPending;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Racecard Reader</h1>
          <p className={styles.subtitle}>
            Upload a racecard to read stewards &amp; vet comments clearly, and print exactly what you need
          </p>
        </div>
        <div className={styles.userButton}>
          <UserButton />
        </div>
      </div>

      <div
        className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ""}`}
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.csv,application/pdf,text/csv"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        <div className={styles.iconCircle}>{busy ? "…" : "↑"}</div>
        <div className={styles.dropzoneTitle}>
          {uploadMutation.isPending
            ? "Uploading & reading your racecard…"
            : "Drop a racecard here, or click to upload"}
        </div>
        <div className={styles.dropzoneSubtitle}>
          PDF or CSV · Full race meeting with stewards / vet comments
        </div>
      </div>

      <button className={styles.demoLink} onClick={handleTryDemo} disabled={busy}>
        {seedDemoMutation.isPending ? "Loading demo meeting…" : "Or try it with a sample demo meeting →"}
      </button>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.recentSection}>
        <div className={styles.sectionLabel}>Recent uploads</div>
        {isLoading && <div className={styles.emptyState}>Loading…</div>}
        {!isLoading && meetings?.length === 0 && (
          <div className={styles.emptyState}>Nothing uploaded yet.</div>
        )}
        {meetings?.map((m) => {
          const failed = m.status === "failed";
          const processing = m.status === "processing";
          return (
            <div
              key={m.id}
              className={`${styles.uploadRow} ${failed ? styles.uploadRowDisabled : ""}`}
              onClick={() => !failed && router.push(`/meetings/${m.id}/races/1`)}
            >
              <div>
                <div className={styles.uploadName}>{m.courseName ?? m.sourceFileName}</div>
                <div className={styles.uploadMeta}>
                  {failed
                    ? m.errorMessage ?? "Failed to parse this racecard."
                    : processing
                    ? "Processing…"
                    : `${formatRelativeDate(m.createdAt)} · ${m.raceCount} races · ${m.runnerCount} runners`}
                </div>
              </div>
              {!processing && (
                <span
                  className={`${styles.badge} ${failed ? styles.badgeFailed : ""}`}
                >
                  {failed ? "Failed" : `${m.reportCount} reports`}
                </span>
              )}
              {processing && <span className={`${styles.badge} ${styles.badgeProcessing}`}>Processing</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
