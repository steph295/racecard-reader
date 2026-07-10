"use client";

import type { ColumnVisibility } from "@/lib/types";
import styles from "./FiltersPanel.module.css";

interface FiltersPanelProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  privilegeOptions: { tag: string; label: string; count: number }[];
  excludedPrivTags: string[];
  onTogglePrivTag: (tag: string) => void;
  onResetPrivTags: () => void;
  commentLimit: number | null;
  onChangeCommentLimit: (limit: number | null) => void;
  visibility: ColumnVisibility;
  onToggleColumn: (key: keyof ColumnVisibility) => void;
  onResetColumns: () => void;
}

const COMMENT_LIMIT_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Last run", value: 1 },
  { label: "Last 3 runs", value: 3 },
  { label: "Last 6 runs", value: 6 },
  { label: "All", value: null },
];

function chipClass(active: boolean) {
  return `${styles.chip} ${active ? styles.chipActive : ""}`;
}

export function FiltersPanel({
  open,
  onToggle,
  onClose,
  search,
  onSearchChange,
  privilegeOptions,
  excludedPrivTags,
  onTogglePrivTag,
  onResetPrivTags,
  commentLimit,
  onChangeCommentLimit,
  visibility,
  onToggleColumn,
  onResetColumns,
}: FiltersPanelProps) {
  return (
    <div className={`rc-noprint ${styles.wrapper}`}>
      <button
        className={`${styles.filtersButton} ${open ? styles.filtersButtonOpen : ""}`}
        onClick={onToggle}
      >
        <span className={styles.hamburger}>
          <span className={styles.hamburgerBar1} />
          <span className={styles.hamburgerBar2} />
          <span className={styles.hamburgerBar3} />
        </span>
        Filters
        <span className={styles.chevron}>▾</span>
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={onClose} />
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.sectionLabel}>Filters</div>
              <button className={styles.resetLink} onClick={onResetColumns}>
                Reset columns
              </button>
            </div>

            <input
              type="text"
              placeholder="Search horse, jockey or trainer..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className={styles.searchInput}
            />

            <div className={styles.group}>
              <div className={styles.sectionLabel}>Show columns</div>
              <div className={styles.chipRow}>
                <button className={chipClass(visibility.silk)} onClick={() => onToggleColumn("silk")}>
                  Silk
                </button>
                <button className={chipClass(visibility.no)} onClick={() => onToggleColumn("no")}>
                  No.
                </button>
                <button className={chipClass(visibility.horse)} onClick={() => onToggleColumn("horse")}>
                  Horse
                </button>
                <button className={chipClass(visibility.jt)} onClick={() => onToggleColumn("jt")}>
                  Jockey / Trainer
                </button>
                <button className={chipClass(visibility.comments)} onClick={() => onToggleColumn("comments")}>
                  Comments
                </button>
                <button className={chipClass(visibility.notes)} onClick={() => onToggleColumn("notes")}>
                  My Notes
                </button>
              </div>
            </div>

            <div className={styles.group}>
              <div className={styles.panelHeader}>
                <div className={styles.sectionLabel}>Privileges</div>
                {excludedPrivTags.length > 0 && (
                  <button className={styles.resetLink} onClick={onResetPrivTags}>
                    Show all
                  </button>
                )}
              </div>
              {privilegeOptions.length === 0 ? (
                <div className={styles.emptyHint}>Upload a privileges sheet to filter by privilege.</div>
              ) : (
                <div className={styles.checkList}>
                  {privilegeOptions.map((opt) => {
                    const checked = !excludedPrivTags.includes(opt.tag);
                    return (
                      <label
                        key={opt.tag}
                        className={`${styles.checkRow} ${checked ? styles.checkRowChecked : ""}`}
                        title={opt.tag}
                      >
                        <input type="checkbox" checked={checked} onChange={() => onTogglePrivTag(opt.tag)} />
                        <span className={styles.checkLabel}>{opt.label}</span>
                        <span className={styles.checkCount}>({opt.count})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={styles.group}>
              <div className={styles.sectionLabel}>Runs since comment</div>
              <div className={styles.radioList}>
                {COMMENT_LIMIT_OPTIONS.map((opt) => {
                  const selected = commentLimit === opt.value;
                  return (
                    <label
                      key={opt.label}
                      className={`${styles.radioRow} ${selected ? styles.radioRowSelected : ""}`}
                    >
                      <input
                        type="radio"
                        name="comment-limit"
                        checked={selected}
                        onChange={() => onChangeCommentLimit(opt.value)}
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className={styles.tip}>Tip: drag any column border in the table to reallocate width before printing.</div>
          </div>
        </>
      )}
    </div>
  );
}
