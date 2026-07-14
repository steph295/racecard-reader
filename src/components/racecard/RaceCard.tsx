"use client";

import { useMemo, useRef } from "react";
import type { PrivilegeGlossary } from "@/lib/privilegeGlossary";
import type { RaceDTO, RunnerDTO } from "@/lib/types";
import { COLUMN_ORDER, type ColumnKey, type ColumnVisibility, type ColumnWidths } from "@/lib/types";
import type { Divider } from "@/lib/hooks/useColumnResize";
import { useMeasuredDividerPositions } from "@/lib/hooks/useMeasuredDividerPositions";
import { columnStyle, silkColumnStyle } from "@/lib/columnFlex";
import { getSilkUrl } from "@/lib/silks";
import { filterRunners } from "@/lib/filterRunners";
import { horseCommentCategory } from "@/lib/commentCategories";
import { NotesCell } from "./NotesCell";
import { PrivilegeTags } from "./PrivilegeTags";
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

function flattenReports(
  runner: RunnerDTO,
  commentLimit: number | null,
  categoryFilter: string[] | null
): FlatReportRow[] {
  let reports = runner.reports;
  if (categoryFilter) {
    reports = reports
      .map((r) => ({
        ...r,
        items: r.items.filter((item) => {
          const bucket = horseCommentCategory(item.category, item.detail);
          return bucket != null && categoryFilter.includes(bucket);
        }),
      }))
      .filter((r) => r.items.length > 0);
  } else {
    // No category filter active — still drop other-team comments entirely.
    reports = reports
      .map((r) => ({
        ...r,
        items: r.items.filter((item) => horseCommentCategory(item.category, item.detail) != null),
      }))
      .filter((r) => r.items.length > 0);
  }
  const rows: FlatReportRow[] = [];
  limitReports(reports, commentLimit).forEach((report) => {
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
  /** Privilege tags unchecked in Quick filters — hidden per row, not runner removal. */
  hiddenPrivTags: string[];
  /** When set, show only comment entries from these categories. */
  commentCategoryFilter: string[] | null;
  /** Show only the N most recent comment entries per horse (null = all). */
  commentLimit: number | null;
  privilegeGlossary: PrivilegeGlossary;
  onSaveNote: (runnerId: string, body: string) => void;
  /** When true, show every runner and apply print layout (ignore on-screen filters). */
  printMode?: boolean;
}

export function RaceCard({
  race,
  colWidths,
  visibility,
  dividers,
  search,
  hiddenPrivTags,
  commentCategoryFilter,
  commentLimit,
  privilegeGlossary,
  onSaveNote,
  printMode = false,
}: RaceCardProps) {
  const runners = useMemo(
    () => (printMode ? race.runners : filterRunners(race.runners, search)),
    [race.runners, search, printMode]
  );

  // Proportional flex columns — weights come from the user's column widths.
  const noStyle = columnStyle("no", colWidths);
  const horseStyle = columnStyle("horse", colWidths);
  const jtStyle = columnStyle("jt", colWidths);
  const commentsStyle = columnStyle("comments", colWidths);
  const notesStyle = columnStyle("notes", colWidths);
  const silkStyle = silkColumnStyle();
  const headRowRef = useRef<HTMLDivElement>(null);

  const lastColumn = useMemo(() => {
    if (visibility.notes) return "notes";
    if (visibility.comments) return "comments";
    if (visibility.jt) return "jt";
    if (visibility.horse) return "horse";
    if (visibility.no) return "no";
    if (visibility.silk) return "silk";
    return null;
  }, [visibility]);

  const border = (col: string) => (col !== lastColumn ? styles.colBorder : "");

  const visibleCols = useMemo<ColumnKey[]>(() => {
    const show: Record<ColumnKey, boolean> = {
      no: visibility.no,
      horse: visibility.horse,
      jt: visibility.jt,
      comments: visibility.comments,
      notes: visibility.notes,
    };
    return COLUMN_ORDER.filter((k) => show[k]);
  }, [visibility]);

  const layoutKey = `${visibility.silk}-${visibleCols.join(",")}-${colWidths.no}-${colWidths.horse}-${colWidths.jt}-${colWidths.comments}-${colWidths.notes}`;
  const measuredDividers = useMeasuredDividerPositions(
    headRowRef,
    dividers,
    visibleCols,
    visibility.silk,
    layoutKey
  );

  return (
    <div className="rc-card" style={{ marginBottom: printMode ? 0 : 24 }}>
      {measuredDividers.map((d) => (
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

      <div ref={headRowRef} className={styles.headRow}>
        {visibility.silk && <div className={border("silk")} style={silkStyle}>Silk</div>}
        {visibility.no && <div className={border("no")} style={noStyle}>No</div>}
        {visibility.horse && <div className={border("horse")} style={horseStyle}>Horse</div>}
        {visibility.jt && <div className={border("jt")} style={jtStyle}>Jockey / Trainer</div>}
        {visibility.comments && (
          <div className={`rc-grow-cell ${styles.headCommentsCell} ${border("comments")}`} style={commentsStyle}>
            Comments
          </div>
        )}
        {visibility.notes && (
          <div className={`rc-grow-cell ${styles.headNotesCell}`} style={notesStyle}>
            My Notes
          </div>
        )}
      </div>

      <div className="rc-runner-list">
      {runners.map((horse, idx) => {
        const rows = flattenReports(horse, commentLimit, commentCategoryFilter);
        const hasReports = rows.length > 0;
        return (
          <div key={horse.id} className={`rc-row ${styles.row} ${horse.nonRunner ? styles.rowNonRunner : ""}`}>
            {visibility.silk && (
              <div className={`${styles.silkCell} ${border("silk")}`} style={silkStyle}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getSilkUrl(horse.silkImage, horse.silkAssetKey, horse.name, idx)}
                  alt={`${horse.name} silk`}
                  className={styles.silkImage}
                />
              </div>
            )}

            {visibility.no && (
              <div className={`${styles.noCell} ${border("no")}`} style={noStyle}>
                <div className={`${styles.noNumber} rc-truncate`}>{horse.no}</div>
                {horse.draw != null && <div className={`${styles.noDraw} rc-truncate`}>({horse.draw})</div>}
                <div className={`${styles.noForm} rc-truncate`}>{horse.form || "—"}</div>
                <div className={`${styles.noOr} rc-truncate`}>OR {horse.officialRating ?? "—"}</div>
              </div>
            )}

            {visibility.horse && (
              <div className={`${styles.horseCell} ${border("horse")}`} style={horseStyle}>
                <div className={styles.horseName}>{horse.name}</div>
                {visibility.privileges && (
                  <PrivilegeTags
                    privileges={horse.privileges}
                    glossary={privilegeGlossary}
                    hiddenTags={printMode ? [] : hiddenPrivTags}
                  />
                )}
                <div className={`${styles.horseBreeding} rc-wrap`}>
                  {horse.sire ?? "—"} — {horse.dam ?? "—"}
                </div>
                <div className={`${styles.horseAgeWeight} rc-wrap`}>
                  {[horse.ageSex, horse.weight].filter(Boolean).join(" · ")}
                </div>
                {horse.subnote && <div className={styles.horseSubnote}>{horse.subnote}</div>}
              </div>
            )}

            {visibility.jt && (
              <div className={`${styles.jtCell} ${border("jt")}`} style={jtStyle}>
                <div className={`${styles.jtJockey} rc-wrap`}>{horse.jockey ?? "—"}</div>
                <div className={`${styles.jtTrainer} rc-wrap`}>{horse.trainer ?? "—"}</div>
                {horse.owner && <div className={`${styles.jtOwner} rc-wrap`}>{horse.owner}</div>}
              </div>
            )}

            {visibility.comments && <div className={`rc-grow-cell ${styles.commentsCell} ${border("comments")}`} style={commentsStyle}>
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
                columnStyle={notesStyle}
                borderClass={border("notes")}
                initialValue={horse.noteBody}
                onSave={(value) => onSaveNote(horse.id, value)}
              />
            )}
          </div>
        );
      })}
      </div>

      {runners.length === 0 && (
        <div className={styles.noMatches}>
          {search.trim()
            ? `No runners match "${search}"`
            : "No runners match the privileges filter in this race"}
        </div>
      )}
    </div>
  );
}
