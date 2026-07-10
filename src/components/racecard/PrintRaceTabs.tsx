import type { RaceDTO } from "@/lib/types";
import styles from "./PrintRaceTabs.module.css";

interface PrintRaceTabsProps {
  races: RaceDTO[];
  activeRaceNumber: number;
}

/**
 * Race tab strip for the printed/saved PDF only (hidden on screen - the web
 * app has the sidebar for navigation). Each race page in the PDF gets this
 * strip at the top; the anchors become internal PDF links when saved via the
 * browser's Save as PDF, so a steward can tap R5 in the PDF and jump straight
 * to that race's page.
 */
export function PrintRaceTabs({ races, activeRaceNumber }: PrintRaceTabsProps) {
  return (
    <nav className={styles.strip}>
      {races.map((race) => {
        const active = race.number === activeRaceNumber;
        return (
          <a
            key={race.id}
            href={`#race-${race.number}`}
            className={`${styles.tab} ${active ? styles.tabActive : ""}`}
          >
            <span className={styles.tabRace}>R{race.number}</span>
            <span className={styles.tabTime}>{race.time}</span>
          </a>
        );
      })}
    </nav>
  );
}
