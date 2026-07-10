"use client";

import { useEffect } from "react";
import { SILK_COLUMN_WIDTH, type ColumnVisibility, type ColumnWidths } from "@/lib/types";

const PRINT_STYLE_ID = "rc-print-zoom";
// Matches the prototype's updatePrintZoom(): target a ~700px portrait page
// width, and shrink everything uniformly (via CSS zoom, at print time only)
// so a wide, fully-configured table never gets clipped or truncated.
const PORTRAIT_PAGE_TARGET_PX = 700;

/**
 * Recomputes the print-time shrink-to-fit zoom factor whenever the user's
 * column widths/visibility change, and keeps a single <style> tag in <head>
 * up to date with it. This runs continuously (not just right before print)
 * so the zoom is always correct the instant window.print() is triggered -
 * exactly like the original prototype's componentDidMount/componentDidUpdate.
 */
export function usePrintZoom(colWidths: ColumnWidths, visibility: ColumnVisibility) {
  useEffect(() => {
    const total =
      (visibility.silk ? SILK_COLUMN_WIDTH : 0) +
      (visibility.no ? colWidths.no : 0) +
      (visibility.horse ? colWidths.horse : 0) +
      (visibility.jt ? colWidths.jt : 0) +
      (visibility.comments ? colWidths.comments : 0) +
      (visibility.privileges ? colWidths.privileges : 0) +
      (visibility.notes ? colWidths.notes : 0) +
      20;

    const zoom = Math.min(1, PORTRAIT_PAGE_TARGET_PX / total);

    let el = document.getElementById(PRINT_STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = PRINT_STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = `@media print { .rc-card { zoom: ${zoom.toFixed(3)} } }`;
  }, [colWidths, visibility]);
}
