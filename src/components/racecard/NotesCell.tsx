"use client";

import { useState } from "react";
import { useDebouncedCallback } from "@/lib/hooks/useDebouncedCallback";
import styles from "./NotesCell.module.css";

interface NotesCellProps {
  width: number;
  initialValue: string;
  onSave: (value: string) => void;
}

/** Free-text note, saved 500ms after the user stops typing. */
export function NotesCell({ width, initialValue, onSave }: NotesCellProps) {
  // Initialized once from the fetched value; the debounced save keeps the
  // query cache in sync (see useSaveNote's onSuccess), so there's no need
  // to re-sync this local state from props afterwards.
  const [value, setValue] = useState(initialValue);
  const debouncedSave = useDebouncedCallback(onSave, 500);

  return (
    <div className={`rc-notes-cell ${styles.cell}`} style={{ flex: `1 1 ${width}px`, minWidth: width }}>
      <textarea
        className={styles.textarea}
        value={value}
        placeholder="Add a note..."
        onChange={(e) => {
          setValue(e.target.value);
          debouncedSave(e.target.value);
        }}
      />
    </div>
  );
}
