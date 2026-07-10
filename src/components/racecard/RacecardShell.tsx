"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMeeting, useSaveNote, useUploadPrivileges } from "@/lib/hooks/useMeetings";
import { useColumnResize } from "@/lib/hooks/useColumnResize";
import { usePrintZoom } from "@/lib/hooks/usePrintZoom";
import { Sidebar } from "./Sidebar";
import { FiltersPanel } from "./FiltersPanel";
import { RaceCard } from "./RaceCard";
import { RaceTabs } from "./RaceTabs";
import styles from "./RacecardShell.module.css";

// Typical full-meeting parse takes 30–120s. We simulate a progress bar that
// fills quickly at first then slows toward 90%, leaving the last 10% for the
// actual completion signal (status flipping to "ready").
const ESTIMATED_MS = 90_000;

function ProcessingState({ createdAt }: { createdAt: string }) {
  const startMs = new Date(createdAt).getTime();
  const [elapsed, setElapsed] = useState(() => Date.now() - startMs);

  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startMs), 500);
    return () => clearInterval(id);
  }, [startMs]);

  const rawPct = Math.min(elapsed / ESTIMATED_MS, 1);
  // Ease toward 90% — never shows 100% until the page actually refreshes
  const pct = Math.min(rawPct * 90, 90);

  const secs = Math.floor(elapsed / 1000);
  const mins = Math.floor(secs / 60);
  const elapsedLabel = mins > 0 ? `${mins}m ${secs % 60}s` : `${secs}s`;

  const steps = [
    { label: "Extracting text from file", threshold: 0 },
    { label: "Sending to AI for structuring", threshold: 8 },
    { label: "Reading races and runners", threshold: 20 },
    { label: "Parsing stewards & vet reports", threshold: 45 },
    { label: "Saving to database", threshold: 82 },
  ];
  const currentStep = [...steps].reverse().find((s) => pct >= s.threshold)!;

  return (
    <div className={styles.processingWrap}>
      <div className={styles.processingIcon}>⏳</div>
      <div className={styles.processingTitle}>Reading your racecard…</div>
      <div className={styles.processingStep}>{currentStep.label}</div>
      <div className={styles.progressTrack}>
        <div className={styles.progressBar} style={{ width: `${pct.toFixed(1)}%` }} />
      </div>
      <div className={styles.processingMeta}>{elapsedLabel} elapsed · full meetings can take up to 2 min</div>
    </div>
  );
}

interface RacecardShellProps {
  meetingId: string;
  raceNumber: number;
}

export function RacecardShell({ meetingId, raceNumber }: RacecardShellProps) {
  const router = useRouter();
  const { data: meeting, isLoading, error } = useMeeting(meetingId);
  const saveNote = useSaveNote(meetingId);
  const uploadPrivileges = useUploadPrivileges(meetingId);
  const privilegesInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [commentLimit, setCommentLimit] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [printAll, setPrintAll] = useState(false);
  const [printUnsupported, setPrintUnsupported] = useState(false);
  const [privilegesNotice, setPrivilegesNotice] = useState<string | null>(null);

  // Match the prototype: switching races clears the in-progress search.
  // Adjusting state during render (rather than in an effect) avoids an
  // extra commit - see https://react.dev/learn/you-might-not-need-an-effect.
  const [lastRaceNumber, setLastRaceNumber] = useState(raceNumber);
  if (raceNumber !== lastRaceNumber) {
    setLastRaceNumber(raceNumber);
    setSearch("");
  }

  // Deep in a 20-runner field, tapping another race tab must land at the top
  // of that race immediately - no smooth scroll, the steward is mid-broadcast.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [raceNumber]);

  const handleSelectRace = useCallback(
    (n: number) => router.push(`/meetings/${meetingId}/races/${n}`),
    [router, meetingId]
  );

  const { colWidths, visibility, dividers, resetColumns, toggleColumn } = useColumnResize();
  usePrintZoom(colWidths, visibility);

  const handlePrintAll = useCallback(() => {
    // Embedded editor webviews (e.g. the Cursor/VS Code browser panel) can't
    // show the native print dialog - calling window.print() there crashes the
    // whole host window. Detect them and show guidance instead.
    const ua = navigator.userAgent;
    const isEmbeddedWebview = /Electron|Cursor|VSCode|Code\//i.test(ua);
    if (isEmbeddedWebview) {
      setPrintUnsupported(true);
      return;
    }
    setPrintAll(true);
    setTimeout(() => {
      window.print();
      setPrintAll(false);
    }, 80);
  }, []);

  const handleSaveNote = useCallback(
    (runnerId: string, body: string) => saveNote.mutate({ runnerId, body }),
    [saveNote]
  );

  const handlePrivilegesFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // allow re-uploading the same file
      if (!file) return;
      uploadPrivileges.mutate(file, {
        onSuccess: (result) => {
          const parts = [`Privileges added for ${result.matched} runner${result.matched === 1 ? "" : "s"}.`];
          if (result.unmatched.length > 0) {
            parts.push(`Not on this card: ${result.unmatched.join(", ")}.`);
          }
          setPrivilegesNotice(parts.join(" "));
        },
        onError: (err) => {
          setPrivilegesNotice(err instanceof Error ? err.message : "Couldn't read that sheet.");
        },
      });
    },
    [uploadPrivileges]
  );

  if (isLoading) {
    return <div className={styles.centeredState}>Loading racecard…</div>;
  }

  if (error || !meeting) {
    return (
      <div className={styles.centeredState}>
        <div className={styles.errorTitle}>Couldn&apos;t load this meeting.</div>
        {error instanceof Error ? error.message : "It may not exist, or you may not have access."}
        <button className={styles.backLink} onClick={() => router.push("/upload")}>
          ← Back to uploads
        </button>
      </div>
    );
  }

  if (meeting.status === "processing" || meeting.status === "pending") {
    return <ProcessingState createdAt={meeting.createdAt} />;
  }

  if (meeting.status === "failed") {
    return (
      <div className={styles.centeredState}>
        <div className={styles.errorTitle}>Couldn&apos;t parse this racecard.</div>
        {meeting.errorMessage ?? "Please try re-uploading, or use a different file."}
        <button className={styles.backLink} onClick={() => router.push("/upload")}>
          ← Back to uploads
        </button>
      </div>
    );
  }

  const currentRace = meeting.races.find((r) => r.number === raceNumber) ?? meeting.races[0];
  if (!currentRace) {
    return <div className={styles.centeredState}>This meeting has no races.</div>;
  }

  const racesToRender = printAll ? meeting.races : [currentRace];

  return (
    <div className={styles.layout}>
      <Sidebar
        meetingId={meetingId}
        races={meeting.races}
        activeRaceId={currentRace.id}
        onPrintAll={handlePrintAll}
        printing={printAll}
      />

      <div className={`rc-shell ${styles.main}`}>
        <RaceTabs races={meeting.races} activeRaceNumber={currentRace.number} onSelectRace={handleSelectRace} />

        {printUnsupported && (
          <div className={`rc-noprint ${styles.printNotice}`}>
            <span>
              Printing isn&apos;t supported in this embedded browser. Open{" "}
              <strong>{typeof window !== "undefined" ? window.location.host : ""}</strong> in
              Chrome or Safari and print from there.
            </span>
            <button
              className={styles.printNoticeCopy}
              onClick={() => {
                void navigator.clipboard.writeText(window.location.href);
              }}
            >
              Copy link
            </button>
            <button className={styles.printNoticeClose} onClick={() => setPrintUnsupported(false)}>
              ✕
            </button>
          </div>
        )}
        <div className={`rc-noprint ${styles.toolbar}`}>
          <FiltersPanel
            open={filtersOpen}
            onToggle={() => setFiltersOpen((v) => !v)}
            onClose={() => setFiltersOpen(false)}
            search={search}
            onSearchChange={setSearch}
            commentLimit={commentLimit}
            onChangeCommentLimit={setCommentLimit}
            visibility={visibility}
            onToggleColumn={toggleColumn}
            onResetColumns={resetColumns}
          />
          <input
            ref={privilegesInputRef}
            type="file"
            accept=".xls,.xlsx,.html,.htm"
            style={{ display: "none" }}
            onChange={handlePrivilegesFile}
          />
          <button
            className={styles.privilegesUploadBtn}
            onClick={() => privilegesInputRef.current?.click()}
            disabled={uploadPrivileges.isPending}
          >
            {uploadPrivileges.isPending ? "Reading sheet…" : "⇪ Upload privileges sheet"}
          </button>
        </div>

        {privilegesNotice && (
          <div className={`rc-noprint ${styles.printNotice}`}>
            <span>{privilegesNotice}</span>
            <button className={styles.printNoticeClose} onClick={() => setPrivilegesNotice(null)}>
              ✕
            </button>
          </div>
        )}

        <div className={styles.cardsScroller}>
          {racesToRender.map((race, i) => (
            <RaceCard
              key={race.id}
              race={race}
              colWidths={colWidths}
              visibility={visibility}
              dividers={dividers}
              search={search}
              commentLimit={commentLimit}
              onSaveNote={handleSaveNote}
              pageBreakAfter={i < racesToRender.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
