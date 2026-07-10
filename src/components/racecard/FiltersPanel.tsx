"use client";

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
  commentCategoryOptions: { category: string; count: number }[];
  checkedCommentCats: string[];
  onToggleCommentCat: (category: string) => void;
  commentLimit: number | null;
  onChangeCommentLimit: (limit: number | null) => void;
  visibleRunners: number;
  totalRunners: number;
  activeCount: number;
  onClearAll: () => void;
}

const COMMENT_LIMIT_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Last run", value: 1 },
  { label: "Last 3 runs", value: 3 },
  { label: "Last 6 runs", value: 6 },
  { label: "All", value: null },
];

export function FiltersPanel({
  open,
  onToggle,
  onClose,
  search,
  onSearchChange,
  privilegeOptions,
  excludedPrivTags,
  onTogglePrivTag,
  commentCategoryOptions,
  checkedCommentCats,
  onToggleCommentCat,
  commentLimit,
  onChangeCommentLimit,
  visibleRunners,
  totalRunners,
  activeCount,
  onClearAll,
}: FiltersPanelProps) {
  const showingLabel =
    visibleRunners === totalRunners
      ? `Showing all of ${totalRunners} runners`
      : `Showing ${visibleRunners} of ${totalRunners} runners`;

  return (
    <div className={`rc-noprint ${styles.wrapper}`}>
      <button
        className={`${styles.filtersButton} ${open || activeCount > 0 ? styles.filtersButtonActive : ""}`}
        onClick={onToggle}
      >
        <span className={styles.filterIcon}>☰</span>
        Filters
        {activeCount > 0 && <span className={styles.activeCount}>/ {activeCount}</span>}
        <span className={styles.chevron}>▾</span>
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={onClose} />
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitleRow}>
                <span className={styles.panelTitle}>Quick filters</span>
                <span className={styles.showingLabel}>{showingLabel}</span>
              </div>
              <button className={styles.resetLink} onClick={onClearAll}>
                Clear all
              </button>
            </div>

            <input
              type="text"
              placeholder="Search horse, jockey or trainer..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className={styles.searchInput}
            />

            <div className={styles.columns}>
              <div className={styles.column}>
                <div className={styles.sectionLabel}>Privileges</div>
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

              <div className={styles.column}>
                <div className={styles.sectionLabel}>Horse comments</div>
                <div className={styles.checkList}>
                  {commentCategoryOptions.map((opt) => {
                    const checked = checkedCommentCats.includes(opt.category);
                    return (
                      <label
                        key={opt.category}
                        className={`${styles.checkRow} ${checked ? styles.checkRowChecked : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleCommentCat(opt.category)}
                        />
                        <span className={styles.checkLabel}>{opt.category}</span>
                        <span className={styles.checkCount}>({opt.count})</span>
                      </label>
                    );
                  })}
                </div>

                <div className={`${styles.sectionLabel} ${styles.sectionLabelSpaced}`}>Runs since comment</div>
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
            </div>
          </div>
        </>
      )}
    </div>
  );
}
