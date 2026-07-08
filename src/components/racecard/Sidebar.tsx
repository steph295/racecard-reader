"use client";

import { useRouter } from "next/navigation";
import type { RaceDTO } from "@/lib/types";
import styles from "./Sidebar.module.css";

function shortenName(name: string): string {
  return name.length > 30 ? `${name.slice(0, 30)}…` : name;
}

interface SidebarProps {
  meetingId: string;
  races: RaceDTO[];
  activeRaceId: string;
  onPrintAll: () => void;
  printing: boolean;
}

export function Sidebar({ meetingId, races, activeRaceId, onPrintAll, printing }: SidebarProps) {
  const router = useRouter();

  return (
    <nav className={`rc-noprint ${styles.nav}`}>
      <div className={styles.topRow}>
        <button className={styles.backLink} onClick={() => router.push("/upload")}>
          ← Upload
        </button>
        <button className={styles.printButton} onClick={onPrintAll} disabled={printing}>
          {printing ? "Preparing…" : "Print racecard"}
        </button>
      </div>
      <div className={styles.sectionLabel}>Races</div>
      {races.map((race) => {
        const reportCount = race.runners.filter((r) => r.reports.length > 0).length;
        const active = race.id === activeRaceId;
        return (
          <div
            key={race.id}
            className={`${styles.raceItem} ${active ? styles.raceItemActive : ""}`}
            onClick={() => router.push(`/meetings/${meetingId}/races/${race.number}`)}
          >
            <div className={styles.raceItemTitle}>
              {race.number}. {race.time} {shortenName(race.name)}
            </div>
            <div className={styles.raceItemMeta}>
              {race.runners.length} runners{reportCount > 0 ? ` · ${reportCount} reports` : ""}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
