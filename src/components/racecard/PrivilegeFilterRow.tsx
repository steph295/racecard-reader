"use client";

import { useState } from "react";
import type { PrivilegeGlossary } from "@/lib/privilegeGlossary";
import { defaultGlossaryEntry } from "@/lib/privilegeGlossary";
import styles from "./FiltersPanel.module.css";

interface PrivilegeFilterRowProps {
  tag: string;
  glossary: PrivilegeGlossary;
  count: number;
  checked: boolean;
  onToggle: () => void;
  onUpdate: (label: string, abbr: string) => void;
}

export function PrivilegeFilterRow({
  tag,
  glossary,
  count,
  checked,
  onToggle,
  onUpdate,
}: PrivilegeFilterRowProps) {
  const entry = glossary[tag] ?? defaultGlossaryEntry(tag);
  const [editing, setEditing] = useState(false);
  const [labelDraft, setLabelDraft] = useState(entry.label);
  const [abbrDraft, setAbbrDraft] = useState(entry.abbr);

  const startEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLabelDraft(entry.label);
    setAbbrDraft(entry.abbr);
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    onUpdate(labelDraft, abbrDraft);
  };

  if (editing) {
    return (
      <div className={`${styles.checkRow} ${styles.checkRowEditing}`}>
        <input type="checkbox" checked={checked} onChange={onToggle} />
        <input
          className={styles.privLabelInput}
          value={labelDraft}
          onChange={(e) => setLabelDraft(e.target.value)}
          placeholder="Long name"
        />
        <input
          className={styles.privAbbrInput}
          value={abbrDraft}
          onChange={(e) => setAbbrDraft(e.target.value)}
          placeholder="ABBR"
        />
        <span className={styles.checkCount}>({count})</span>
        <button type="button" className={styles.privEditSave} onClick={commit}>
          ✓
        </button>
        <button type="button" className={styles.privEditCancel} onClick={() => setEditing(false)}>
          ✕
        </button>
      </div>
    );
  }

  return (
    <label className={`${styles.checkRow} ${checked ? styles.checkRowChecked : ""}`}>
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <span className={styles.checkLabel}>{entry.label}</span>
      <span className={styles.privFilterTag} title={entry.label}>
        {entry.abbr}
      </span>
      <span className={styles.checkCount}>({count})</span>
      <button type="button" className={styles.privRowEdit} onClick={startEdit} title="Edit label and abbreviation">
        ✎
      </button>
    </label>
  );
}
