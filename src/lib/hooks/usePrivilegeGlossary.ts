"use client";

import { useCallback, useState } from "react";
import {
  type PrivilegeGlossary,
  loadPrivilegeGlossary,
  savePrivilegeGlossary,
} from "@/lib/privilegeGlossary";

/** Per-meeting privilege label/abbreviation overrides, persisted in localStorage. */
export function usePrivilegeGlossary(meetingId: string) {
  const [glossary, setGlossary] = useState<PrivilegeGlossary>(() =>
    loadPrivilegeGlossary(meetingId)
  );

  const updateEntry = useCallback(
    (tag: string, label: string, abbr: string) => {
      setGlossary((prev) => {
        const next = { ...prev, [tag]: { label: label.trim(), abbr: abbr.trim() || tag } };
        savePrivilegeGlossary(meetingId, next);
        return next;
      });
    },
    [meetingId]
  );

  return { glossary, updateEntry };
}
