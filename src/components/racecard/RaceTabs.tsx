"use client";

import { useEffect, useRef } from "react";
import type { RaceDTO } from "@/lib/types";
import styles from "./RaceTabs.module.css";

interface RaceTabsProps {
  races: RaceDTO[];
  activeRaceNumber: number;
  onSelectRace: (raceNumber: number) => void;
}

/**
 * Fixed race navigation for race day: stays pinned to the top of the viewport
 * while the steward scrolls through a long field, so switching races is one
 * tap without losing the broadcast. Hidden on print via rc-noprint.
 */
export function RaceTabs({ races, activeRaceNumber, onSelectRace }: RaceTabsProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  // With many races the strip scrolls horizontally - keep the active tab in view.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeRaceNumber]);

  return (
    <div className={`rc-noprint ${styles.bar}`}>
      <div className={styles.strip} role="tablist" aria-label="Races">
        {races.map((race) => {
          const active = race.number === activeRaceNumber;
          return (
            <button
              key={race.id}
              ref={active ? activeRef : undefined}
              role="tab"
              aria-selected={active}
              className={`${styles.tab} ${active ? styles.tabActive : ""}`}
              onClick={() => onSelectRace(race.number)}
            >
              <span className={styles.tabRace}>R{race.number}</span>
              <span className={styles.tabTime}>{race.time}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
