"use client";

import { useState } from "react";
import { privilegesToTags, tagMeaning } from "@/lib/privilegeTags";
import styles from "./RaceCard.module.css";

interface PrivilegeTagsProps {
  privileges: string | null;
  onSave: (value: string) => void;
}

/**
 * The abbreviated privilege tags under a horse name. Hovering a tag shows its
 * full meaning; the pencil (screen only, revealed on row hover) opens an
 * inline editor where tags are typed as comma-separated codes.
 */
export function PrivilegeTags({ privileges, onSave }: PrivilegeTagsProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const tags = privilegesToTags(privileges);

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== tags.join(", ")) onSave(draft.trim());
  };

  if (editing) {
    return (
      <input
        className={`rc-noprint ${styles.privEditInput}`}
        autoFocus
        value={draft}
        placeholder="e.g. RH, B1, Ear out"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        onBlur={commit}
      />
    );
  }

  return (
    <div className={styles.privTagRow}>
      {tags.map((tag) => (
        <span key={tag} className={styles.privTag} title={tagMeaning(tag)}>
          {tag}
        </span>
      ))}
      <button
        className={`rc-noprint ${styles.privEditBtn}`}
        title={tags.length > 0 ? "Edit privileges" : "Add privileges"}
        onClick={() => {
          setDraft(tags.join(", "));
          setEditing(true);
        }}
      >
        ✎
      </button>
    </div>
  );
}
