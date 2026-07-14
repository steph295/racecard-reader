"use client";

import { useLayoutEffect, useState, type RefObject } from "react";
import type { ColumnKey } from "@/lib/types";
import type { Divider } from "./useColumnResize";

/**
 * Maps resize-handle dividers to the actual rendered column edges. Percentage
 * positions drift when flex columns grow/shrink, so we measure the header row.
 */
export function useMeasuredDividerPositions(
  headRowRef: RefObject<HTMLDivElement | null>,
  dividers: Divider[],
  visibleCols: ColumnKey[],
  includeSilk: boolean,
  layoutKey: string
): Divider[] {
  const [positions, setPositions] = useState<number[]>([]);

  useLayoutEffect(() => {
    const el = headRowRef.current;
    if (!el) return;

    const measure = () => {
      const cells = Array.from(el.children) as HTMLElement[];
      const indices: number[] = [];
      let cellIdx = includeSilk ? 1 : 0;
      for (let i = 0; i < visibleCols.length - 1; i++) {
        indices.push(cellIdx);
        cellIdx++;
      }
      indices.push(cellIdx);

      const pos = indices.map((i) => {
        const cell = cells[i];
        return cell ? cell.offsetLeft + cell.offsetWidth : 0;
      });
      setPositions(pos);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const card = el.closest(".rc-card");
    if (card) ro.observe(card);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [headRowRef, layoutKey, dividers.length, visibleCols, includeSilk]);

  if (positions.length !== dividers.length) return dividers;

  return dividers.map((d, i) => ({
    ...d,
    left: positions[i],
  }));
}
