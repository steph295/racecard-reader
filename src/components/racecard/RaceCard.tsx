"use client";

import { useMemo } from "react";
import type { RaceDTO, RunnerDTO } from "@/lib/types";
import { COLUMN_MIN_WIDTHS, SILK_COLUMN_WIDTH, type ColumnVisibility, type ColumnWidths } from "@/lib/types";
import type { Divider } from "@/lib/hooks/useColumnResize";
import { getSilkUrl } from "@/lib/silks";
import { privilegesToTags } from "@/lib/privilegeTags";
import { NotesCell } from "./NotesCell";
import styles from "./RaceCard.module.css";

interface FlatReportRow {
  key: string;
  date: string | null;
  time: string | null;
  track: string | null;
  first: boolean;
  category: string;
  tag: string | null;
  detail: string;
}

/** Best-effort parse of racecard report dates like "21 May", "10 May 07:30", "21/05/25". */
function parseReportDate(date: string | null): number | null {
  if (!date) return null;
  const trimmed = date.trim();
  const dmy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (dmy) {
    const year = dmy[3].length === 2 ? 2000 + parseInt(dmy[3], 10) : parseInt(dmy[3], 10);
    return new Date(year, parseInt(dmy[2], 10) - 1, parseInt(dmy[1], 10)).getTime();
  }
  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Keeps only the `limit` most recent report entries. Printed order varies by
 * provider (oldest-first or newest-first), so compare the first and last
 * parseable dates to decide which end holds the recent ones; when dates
 * can't be parsed, assume oldest-first (the common case) and keep the tail.
 */
function limitReports(reports: RunnerDTO["reports"], limit: number | null): RunnerDTO["reports"] {
  if (limit == null || reports.length <= limit) return reports;
  const firstDate = parseReportDate(reports[0].date);
  const lastDate = parseReportDate(reports[reports.length - 1].date);
  const newestFirst = firstDate != null && lastDate != null && firstDate > lastDate;
  return newestFirst ? reports.slice(0, limit) : reports.slice(-limit);
}

function flattenReports(runner: RunnerDTO, commentLimit: number | null): FlatReportRow[] {
  const rows: FlatReportRow[] = [];
  limitReports(runner.reports, commentLimit).forEach((report) => {
    report.items.forEach((item, i) => {
      rows.push({
        key: `${report.id}-${item.id}`,
        date: i === 0 ? report.date : null,
        time: i === 0 ? report.time : null,
        track: i === 0 ? report.track : null,
        first: i === 0,
        category: item.category,
        tag: item.tag,
        detail: item.detail,
      });
    });
  });
  return rows;
}

interface RaceCardProps {
  race: RaceDTO;
  colWidths: ColumnWidths;
  visibility: ColumnVisibility;
  dividers: Divider[];
  search: string;
  /** Show only horses carrying the red hood (RH) privilege. */
  redHoodOnly: boolean;
  /** Show only the N most recent comment entries per horse (null = all). */
  commentLimit: number | null;
  onSaveNote: (runnerId: string, body: string) => void;
  pageBreakAfter: boolean;
}

export function RaceCard({
  race,
  colWidths,
  visibility,
  dividers,
  search,
  redHoodOnly,
  commentLimit,
  onSaveNote,
  pageBreakAfter,
}: RaceCardProps) {
  const runners = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list: RunnerDTO[] = race.runners;
    if (term) {
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(term) ||
          (h.jockey ?? "").toLowerCase().includes(term) ||
          (h.trainer ?? "").toLowerCase().includes(term)
      );
    }
    if (redHoodOnly) {
      list = list.filter((h) => privilegesToTags(h.privileges).includes("RH"));
    }
    return list;
  }, [race.runners, search, redHoodOnly]);

  // The last visible column absorbs leftover width; earlier ones stay fixed.
  const commentsIsLast = visibility.comments && !visibility.notes;
  const commentsCellStyle = commentsIsLast
    ? { flex: `1 1 ${colWidths.comments}px`, minWidth: colWidths.comments }
    : { flex: `0 0 ${colWidths.comments}px`, minWidth: 0 };

  return (
    <div
      className="rc-card"
      style={{ marginBottom: 24, ...(pageBreakAfter ? { pageBreakAfter: "always", breakAfter: "page" } : {}) }}
    >
      {dividers.map((d) => (
        <div
          key={d.key}
          className={`rc-noprint ${styles.divider} ${d.isEnd ? styles.dividerEnd : ""} ${d.active ? styles.dividerActive : ""}`}
          style={{ left: d.left }}
          onMouseDown={d.onMouseDown}
        >
          {!d.isEnd && <div className={styles.dividerLine} />}
        </div>
      ))}

      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderTitle}>
          Race {race.number} · {race.time} {race.name}
        </div>
        <div className={styles.cardHeaderMeta}>
          {[race.going, race.distance, `${race.runners.length} runners`].filter(Boolean).join(" · ")}
        </div>
      </div>

      <div className={styles.headRow}>
        {visibility.silk && <div style={{ width: SILK_COLUMN_WIDTH, flex: `0 0 ${SILK_COLUMN_WIDTH}px` }}>Silk</div>}
        {visibility.no && <div style={{ width: colWidths.no, flex: `0 0 ${colWidths.no}px` }}>No</div>}
        {visibility.horse && <div style={{ width: colWidths.horse, flex: `0 0 ${colWidths.horse}px` }}>Horse</div>}
        {visibility.jt && <div style={{ width: colWidths.jt, flex: `0 0 ${colWidths.jt}px` }}>Jockey / Trainer</div>}
        {visibility.comments && (
          <div className={`rc-grow-cell ${styles.headCommentsCell}`} style={commentsCellStyle}>
            Comments
          </div>
        )}
        {visibility.notes && (
          <div
            className={`rc-grow-cell ${styles.headNotesCell}`}
            style={{ flex: `1 1 ${colWidths.notes}px`, minWidth: colWidths.notes }}
          >
            My Notes
          </div>
        )}
      </div>

      {runners.map((horse, idx) => {
        const rows = flattenReports(horse, commentLimit);
        const hasReports = rows.length > 0;
        return (
          <div key={horse.id} className={`${styles.row} ${horse.nonRunner ? styles.rowNonRunner : ""}`}>
            {visibility.silk && (
              <div className={styles.silkCell} style={{ width: SILK_COLUMN_WIDTH, flex: `0 0 ${SILK_COLUMN_WIDTH}px` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getSilkUrl(horse.silkImage, horse.silkAssetKey, horse.name, idx)}
                  alt={`${horse.name} silk`}
                  className={styles.silkImage}
                />
              </div>
            )}

            {visibility.no && (
              <div className={styles.noCell} style={{ width: colWidths.no, flex: `0 0 ${colWidths.no}px`, minWidth: COLUMN_MIN_WIDTHS.no }}>
                <div className={`${styles.noNumber} rc-truncate`}>{horse.no}</div>
                {horse.draw != null && <div className={`${styles.noDraw} rc-truncate`}>({horse.draw})</div>}
                <div className={`${styles.noForm} rc-truncate`}>{horse.form || "—"}</div>
                <div className={`${styles.noOr} rc-truncate`}>OR {horse.officialRating ?? "—"}</div>
              </div>
            )}

            {visibility.horse && (
              <div className={styles.horseCell} style={{ width: colWidths.horse, flex: `0 0 ${colWidths.horse}px`, minWidth: COLUMN_MIN_WIDTHS.horse }}>
                <div className={`${styles.horseName} rc-truncate`}>{horse.name}</div>
                {(() => {
                  const tags = privilegesToTags(horse.privileges);
                  return tags.length > 0 ? (
                    <div className={styles.privTagRow} title={horse.privileges ?? undefined}>
                      {tags.map((tag) => (
                        <span key={tag} className={styles.privTag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null;
                })()}
                <div className={`${styles.horseBreeding} rc-truncate`}>
                  {horse.sire ?? "—"} — {horse.dam ?? "—"}
                </div>
                <div className={`${styles.horseAgeWeight} rc-truncate`}>
                  {[horse.ageSex, horse.weight].filter(Boolean).join(" · ")}
                </div>
                {horse.subnote && <div className={styles.horseSubnote}>{horse.subnote}</div>}
              </div>
            )}

            {visibility.jt && (
              <div className={styles.jtCell} style={{ width: colWidths.jt, flex: `0 0 ${colWidths.jt}px`, minWidth: COLUMN_MIN_WIDTHS.jt }}>
                <div className={`${styles.jtJockey} rc-truncate`}>{horse.jockey ?? "—"}</div>
                <div className={`${styles.jtTrainer} rc-truncate`}>{horse.trainer ?? "—"}</div>
                {horse.owner && <div className={`${styles.jtOwner} rc-truncate`}>{horse.owner}</div>}
              </div>
            )}

            {visibility.comments && <div className={`rc-grow-cell ${styles.commentsCell}`} style={commentsCellStyle}>
              {hasReports ? (
                <div className={styles.timeline}>
                  {rows.map((row) => (
                    <div key={row.key} className={styles.timelineRow}>
                      {row.first && (
                        <>
                          <div className={styles.timelineDot} />
                          <div className={styles.timelineDate}>
                            {row.date} · {row.time}
                            {row.track ? ` · ${row.track}` : ""}
                          </div>
                        </>
                      )}
                      <div className={styles.timelineDetail}>
                        <span className={styles.timelineCat}>{row.category}</span>
                        {row.tag && <span className={styles.timelineTag}> ({row.tag})</span>}
                        {" — "}
                        {row.detail}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noReports}>—</div>
              )}
            </div>}

            {visibility.notes && (
              <NotesCell
                width={colWidths.notes}
                initialValue={horse.noteBody}
                onSave={(value) => onSaveNote(horse.id, value)}
              />
            )}
          </div>
        );
      })}

      {runners.length === 0 && (
        <div className={styles.noMatches}>
          {search.trim()
            ? `No runners match "${search}"`
            : "No red hood runners in this race"}
        </div>
      )}
    </div>
  );
}
