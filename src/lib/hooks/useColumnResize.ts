"use client";

import { useCallback, useMemo, useState } from "react";
import {
  COLUMN_MIN_WIDTHS,
  COLUMN_ORDER,
  DEFAULT_COLUMN_VISIBILITY,
  DEFAULT_COLUMN_WIDTHS,
  SILK_COLUMN_WIDTH,
  type ColumnKey,
  type ColumnVisibility,
  type ColumnWidths,
} from "@/lib/types";

export interface Divider {
  key: string;
  left: number;
  active: boolean;
  isEnd: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

/**
 * Owns column width/visibility state and the pairwise drag-to-resize
 * behaviour, ported directly from the prototype's startResize /
 * startResizeEnd / buildDividers methods:
 *  - dragging an interior divider trades width between its two neighbours
 *    (their combined width never changes)
 *  - the trailing divider (after the last column) just grows/shrinks that
 *    column alone, up to a generous cap
 * The Silk column is intentionally excluded - it's fixed-size by design.
 */
export function useColumnResize() {
  const [colWidths, setColWidths] = useState<ColumnWidths>(DEFAULT_COLUMN_WIDTHS);
  const [visibility, setVisibility] = useState<ColumnVisibility>(DEFAULT_COLUMN_VISIBILITY);
  const [resizingDivider, setResizingDivider] = useState<number | "end" | -1>(-1);

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

  const startResize = useCallback(
    (leftKey: ColumnKey, rightKey: ColumnKey, dividerIndex: number, e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startLeft = colWidths[leftKey];
      const startRight = colWidths[rightKey];
      const pairTotal = startLeft + startRight;
      setResizingDivider(dividerIndex);

      const onMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startX;
        let newLeft = startLeft + delta;
        newLeft = Math.max(COLUMN_MIN_WIDTHS[leftKey], Math.min(pairTotal - COLUMN_MIN_WIDTHS[rightKey], newLeft));
        const newRight = pairTotal - newLeft;
        setColWidths((prev) => ({ ...prev, [leftKey]: newLeft, [rightKey]: newRight }));
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        setResizingDivider(-1);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [colWidths]
  );

  const startResizeEnd = useCallback(
    (key: ColumnKey, e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = colWidths[key];
      setResizingDivider("end");

      const onMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startX;
        const newWidth = Math.max(COLUMN_MIN_WIDTHS[key], Math.min(1000, startWidth + delta));
        setColWidths((prev) => ({ ...prev, [key]: newWidth }));
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        setResizingDivider(-1);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [colWidths]
  );

  const dividers = useMemo<Divider[]>(() => {
    const result: Divider[] = [];
    let left = visibility.silk ? SILK_COLUMN_WIDTH : 0;
    for (let i = 0; i < visibleCols.length; i++) {
      left += colWidths[visibleCols[i]];
      if (i < visibleCols.length - 1) {
        const leftKey = visibleCols[i];
        const rightKey = visibleCols[i + 1];
        result.push({
          key: `div-${i}`,
          left,
          active: resizingDivider === i,
          isEnd: false,
          onMouseDown: (e) => startResize(leftKey, rightKey, i, e),
        });
      }
    }
    const lastKey = visibleCols[visibleCols.length - 1];
    result.push({
      key: "div-end",
      left,
      active: resizingDivider === "end",
      isEnd: true,
      onMouseDown: (e) => startResizeEnd(lastKey, e),
    });
    return result;
  }, [visibleCols, colWidths, visibility.silk, resizingDivider, startResize, startResizeEnd]);

  const resetColumns = useCallback(() => {
    setColWidths(DEFAULT_COLUMN_WIDTHS);
    setVisibility(DEFAULT_COLUMN_VISIBILITY);
  }, []);

  const toggleColumn = useCallback((key: keyof ColumnVisibility) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return {
    colWidths,
    visibility,
    visibleCols,
    dividers,
    resetColumns,
    toggleColumn,
  };
}
