"use client";

import type { ColumnVisibility } from "@/lib/types";
import styles from "./FiltersPanel.module.css";

interface FiltersPanelProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  onlyWithComments: boolean;
  onToggleOnlyWithComments: () => void;
  visibility: ColumnVisibility;
  onToggleColumn: (key: keyof ColumnVisibility) => void;
  onResetColumns: () => void;
}

function chipClass(active: boolean) {
  return `${styles.chip} ${active ? styles.chipActive : ""}`;
}

export function FiltersPanel({
  open,
  onToggle,
  onClose,
  search,
  onSearchChange,
  onlyWithComments,
  onToggleOnlyWithComments,
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
              <div className={styles.sectionLabel}>Comments</div>
              <div className={styles.chipRow}>
                <button className={chipClass(onlyWithComments)} onClick={onToggleOnlyWithComments}>
                  With reports only
                </button>
              </div>
            </div>

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
                <button className={chipClass(visibility.privileges)} onClick={() => onToggleColumn("privileges")}>
                  Privileges
                </button>
                <button className={chipClass(visibility.notes)} onClick={() => onToggleColumn("notes")}>
                  My Notes
                </button>
              </div>
            </div>

            <div className={styles.tip}>Tip: drag any column border in the table to reallocate width before printing.</div>
          </div>
        </>
      )}
    </div>
  );
}
