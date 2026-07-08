"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useMeeting, useSaveNote } from "@/lib/hooks/useMeetings";
import { useColumnResize } from "@/lib/hooks/useColumnResize";
import { usePrintZoom } from "@/lib/hooks/usePrintZoom";
import { Sidebar } from "./Sidebar";
import { FiltersPanel } from "./FiltersPanel";
import { RaceCard } from "./RaceCard";
import styles from "./RacecardShell.module.css";

interface RacecardShellProps {
  meetingId: string;
  raceNumber: number;
}

export function RacecardShell({ meetingId, raceNumber }: RacecardShellProps) {
  const router = useRouter();
  const { data: meeting, isLoading, error } = useMeeting(meetingId);
  const saveNote = useSaveNote(meetingId);

  const [search, setSearch] = useState("");
  const [onlyWithComments, setOnlyWithComments] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [printAll, setPrintAll] = useState(false);
  const [printUnsupported, setPrintUnsupported] = useState(false);

  // Match the prototype: switching races clears the in-progress search.
  // Adjusting state during render (rather than in an effect) avoids an
  // extra commit - see https://react.dev/learn/you-might-not-need-an-effect.
  const [lastRaceNumber, setLastRaceNumber] = useState(raceNumber);
  if (raceNumber !== lastRaceNumber) {
    setLastRaceNumber(raceNumber);
    setSearch("");
  }

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
    return (
      <div className={styles.centeredState}>
        Reading your racecard… this can take up to a minute for a full meeting.
      </div>
    );
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
            onlyWithComments={onlyWithComments}
            onToggleOnlyWithComments={() => setOnlyWithComments((v) => !v)}
            visibility={visibility}
            onToggleColumn={toggleColumn}
            onResetColumns={resetColumns}
          />
        </div>

        {racesToRender.map((race, i) => (
          <RaceCard
            key={race.id}
            race={race}
            colWidths={colWidths}
            visibility={visibility}
            dividers={dividers}
            search={search}
            onlyWithComments={onlyWithComments}
            onSaveNote={handleSaveNote}
            pageBreakAfter={i < racesToRender.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
