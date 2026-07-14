"use client";

import { useEffect } from "react";
import { A4_HEIGHT_PX, PAGE_MARGIN_PX } from "@/lib/printScale";

const PRINT_STYLE_ID = "rc-print-global";

/** Injects global print page rules. Per-race sizing uses CSS vars from computeRacePrintMetrics. */
export function usePrintZoom() {
  useEffect(() => {
    let el = document.getElementById(PRINT_STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = PRINT_STYLE_ID;
      document.head.appendChild(el);
    }
    const pageHeight = A4_HEIGHT_PX - 2 * PAGE_MARGIN_PX;
    el.textContent = `
      @page { size: portrait; margin: 5mm; }
      @media print {
        .rc-race-page {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          height: ${pageHeight}px !important;
          max-height: ${pageHeight}px !important;
          overflow: hidden !important;
        }
      }
    `;
  }, []);
}
