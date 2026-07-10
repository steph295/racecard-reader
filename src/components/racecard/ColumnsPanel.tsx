"use client";

import type { ColumnVisibility } from "@/lib/types";
import styles from "./FiltersPanel.module.css";

interface ColumnsPanelProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  visibility: ColumnVisibility;
  onToggleColumn: (key: keyof ColumnVisibility) => void;
  onResetColumns: () => void;
}

/** Display-column toggles — matches the reference "Hide" dropdown (no Other teams). */
const COLUMN_LABELS: { key: keyof ColumnVisibility; label: string }[] = [
  { key: "privileges", label: "Privileges" },
  { key: "notes", label: "Steward notes" },
  { key: "comments", label: "Horse comments" },
];

export function ColumnsPanel({
  open,
  onToggle,
  onClose,
  visibility,
  onToggleColumn,
  onResetColumns,
}: ColumnsPanelProps) {
  return (
    <div className={`rc-noprint ${styles.wrapper}`}>
      <button
        className={`${styles.filtersButton} ${open ? styles.filtersButtonOpen : ""}`}
        onClick={onToggle}
      >
        <svg
          className={styles.eyeIcon}
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Hide
        <span className={styles.chevron}>▾</span>
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={onClose} />
          <div className={`${styles.panel} ${styles.panelNarrow}`}>
            <div className={styles.sectionLabel}>Display columns</div>
            <div className={styles.checkList}>
              {COLUMN_LABELS.map(({ key, label }) => {
                const checked = visibility[key];
                return (
                  <label
                    key={key}
                    className={`${styles.checkRow} ${checked ? styles.checkRowChecked : ""}`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => onToggleColumn(key)} />
                    <span className={styles.checkLabel}>{label}</span>
                  </label>
                );
              })}
            </div>
            <div className={styles.panelFooter}>
              <button className={styles.resetColumnsBtn} onClick={onResetColumns}>
                ↺ Reset columns
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
