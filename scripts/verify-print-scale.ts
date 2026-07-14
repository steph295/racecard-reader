#!/usr/bin/env tsx
/**
 * Verify print scaling for the four required field sizes.
 * Run: npx tsx scripts/verify-print-scale.ts
 */
import {
  A4_HEIGHT_PX,
  PAGE_MARGIN_PX,
  computeRacePrintMetrics,
  estimateRaceOverheadPx,
  ABS_MIN_FONT_PX,
  MAX_FONT_PX,
  ROW_PADDING_PX,
  CONTENT_LINES,
} from "../src/lib/printScale";

const cases = [4, 10, 18, 22] as const;

let ok = true;

for (const n of cases) {
  const m = computeRacePrintMetrics(n);
  const pageContent = A4_HEIGHT_PX - 2 * PAGE_MARGIN_PX;
  const fitsPage = m.totalRaceHeightPx <= pageContent + 0.5;
  const noOverlap = m.fontSizePx + 2 * ROW_PADDING_PX <= m.rowHeightPx + 0.01;
  const fontInRange = m.fontSizePx >= ABS_MIN_FONT_PX && m.fontSizePx <= MAX_FONT_PX;
  const fillsPage = Math.abs(m.totalRaceHeightPx - pageContent) < 1;
  const contentAreaPx = m.rowHeightPx - 2 * ROW_PADDING_PX;
  const linesFit =
    m.fontSizePx * m.lineHeight * CONTENT_LINES <= contentAreaPx + 0.5;
  const overheadOk = m.overheadPx >= estimateRaceOverheadPx(m.fontSizePx) - 1;

  const pass = fitsPage && noOverlap && fontInRange && fillsPage && linesFit && overheadOk;
  if (!pass) ok = false;

  console.log(
    `${pass ? "✓" : "✗"} ${n} runners — font ${m.fontSizePx}px, row ${m.rowHeightPx}px, overhead ${m.overheadPx}px, total ${m.totalRaceHeightPx}px`
  );
  if (!fitsPage) console.log("    FAIL: exceeds one page");
  if (!noOverlap) console.log("    FAIL: font + padding exceeds row height");
  if (!fontInRange) console.log(`    FAIL: font outside ${ABS_MIN_FONT_PX}–${MAX_FONT_PX}px`);
  if (!fillsPage) console.log("    FAIL: does not fill printable area");
  if (!linesFit) console.log("    FAIL: stacked lines exceed row content area");
  if (!overheadOk) console.log("    FAIL: overhead underestimated for font size");
}

process.exit(ok ? 0 : 1);
