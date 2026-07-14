import type { CSSProperties } from "react";
import { SILK_COLUMN_WIDTH, type ColumnKey, type ColumnWidths } from "./types";

/** Fixed-width silk column. */
export function silkColumnStyle(): CSSProperties {
  return {
    flex: `0 0 ${SILK_COLUMN_WIDTH}px`,
    width: SILK_COLUMN_WIDTH,
    minWidth: SILK_COLUMN_WIDTH,
  };
}

/**
 * Proportional flex column: grows/shrinks to fill the card width using the
 * user's configured weights as flex-grow values.
 */
export function columnStyle(key: ColumnKey, colWidths: ColumnWidths): CSSProperties {
  const weight = colWidths[key];
  return {
    flex: `${weight} 1 0`,
    minWidth: 0,
  };
}

/** Total flex weight for visible columns (silk treated as fixed width weight). */
export function totalColumnWeight(
  colWidths: ColumnWidths,
  visibleKeys: ColumnKey[],
  includeSilk: boolean
): number {
  let total = visibleKeys.reduce((sum, k) => sum + colWidths[k], 0);
  if (includeSilk) total += SILK_COLUMN_WIDTH;
  return total;
}
