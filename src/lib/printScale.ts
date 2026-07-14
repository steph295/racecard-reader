/** A4 portrait height at 96 CSS dpi (297 mm). */
export const A4_HEIGHT_PX = 1123;

/** Matches `@page { margin: 5mm }` converted to CSS pixels. */
export const PAGE_MARGIN_PX = Math.round((5 / 25.4) * 96);

/** Legacy constant — prefer estimateRaceOverheadPx(fontSize). */
export const RACE_OVERHEAD_PX = 92;

export const MIN_FONT_PX = 8;
/** Hard floor when 8 px cannot fit stacked lines (very large fields). */
export const ABS_MIN_FONT_PX = 7;
export const MAX_FONT_PX = 16;
export const ROW_PADDING_PX = 4;
/** Max stacked lines in the tallest column (incl. privilege tag row). */
export const CONTENT_LINES = 6;
export const LINE_HEIGHT = 1.2;
export const MIN_LINE_HEIGHT = 1.08;
/** Absolute floor for very large fields when 1.08 still overflows. */
export const ABS_MIN_LINE_HEIGHT = 1.0;

export interface RacePrintMetrics {
  fontSizePx: number;
  rowHeightPx: number;
  rowsAreaPx: number;
  overheadPx: number;
  tagFontSizePx: number;
  cellPaddingPx: number;
  lineHeight: number;
  pageContentHeightPx: number;
  totalRaceHeightPx: number;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Round down so stacked lines never exceed the row after CSS applies the value. */
function floor1(n: number): number {
  return Math.floor(n * 100) / 100;
}

/**
 * Tabs + race header + column headings — all scale with --rc-print-font-size.
 * Fixed 92 px underestimated this for small fields and caused page-level clipping.
 */
export function estimateRaceOverheadPx(fontSizePx: number): number {
  const tabs = fontSizePx * 1.65;
  const header = fontSizePx * 5.0;
  const headRow = fontSizePx * 1.2;
  const gaps = 10;
  return Math.ceil(tabs + header + headRow + gaps);
}

function fitFontAndLineHeight(
  rowHeightPx: number
): { fontSizePx: number; lineHeight: number; contentAreaPx: number } {
  const contentAreaPx = rowHeightPx - 2 * ROW_PADDING_PX;

  let fontSizePx = rowHeightPx / 3;
  fontSizePx = Math.min(MAX_FONT_PX, Math.max(MIN_FONT_PX, fontSizePx));

  const maxFontForPadding = rowHeightPx - 2 * ROW_PADDING_PX;
  if (fontSizePx > maxFontForPadding) {
    fontSizePx = Math.max(MIN_FONT_PX, maxFontForPadding);
  }

  const maxFontForLines = contentAreaPx / (CONTENT_LINES * LINE_HEIGHT);
  fontSizePx = Math.min(fontSizePx, maxFontForLines);
  fontSizePx = Math.max(MIN_FONT_PX, fontSizePx);

  let lineHeight = LINE_HEIGHT;
  if (fontSizePx * lineHeight * CONTENT_LINES > contentAreaPx) {
    lineHeight = contentAreaPx / (CONTENT_LINES * fontSizePx);
    lineHeight = Math.max(MIN_LINE_HEIGHT, lineHeight);
  }
  if (fontSizePx * lineHeight * CONTENT_LINES > contentAreaPx) {
    lineHeight = floor1(contentAreaPx / (CONTENT_LINES * fontSizePx));
    lineHeight = Math.max(MIN_LINE_HEIGHT, lineHeight);
  }
  if (fontSizePx * lineHeight * CONTENT_LINES > contentAreaPx) {
    fontSizePx = floor1(contentAreaPx / (CONTENT_LINES * lineHeight));
    fontSizePx = Math.max(ABS_MIN_FONT_PX, fontSizePx);
    lineHeight = floor1(contentAreaPx / (CONTENT_LINES * fontSizePx));
    lineHeight = Math.max(MIN_LINE_HEIGHT, lineHeight);
  }
  if (fontSizePx * lineHeight * CONTENT_LINES > contentAreaPx) {
    lineHeight = floor1(contentAreaPx / (CONTENT_LINES * fontSizePx));
    lineHeight = Math.max(ABS_MIN_LINE_HEIGHT, lineHeight);
  }

  let finalFont = round1(fontSizePx);
  let finalLineHeight = floor1(lineHeight);

  while (finalFont * finalLineHeight * CONTENT_LINES > contentAreaPx + 0.01) {
    const targetLh = floor1(contentAreaPx / (CONTENT_LINES * finalFont));
    if (targetLh < finalLineHeight && targetLh >= ABS_MIN_LINE_HEIGHT) {
      finalLineHeight = targetLh;
      continue;
    }
    const targetFont = floor1(contentAreaPx / (CONTENT_LINES * finalLineHeight));
    if (targetFont < finalFont && targetFont >= ABS_MIN_FONT_PX) {
      finalFont = targetFont;
      continue;
    }
    finalLineHeight = floor1(contentAreaPx / (CONTENT_LINES * finalFont));
    break;
  }

  return { fontSizePx: finalFont, lineHeight: finalLineHeight, contentAreaPx };
}

/**
 * Single scaling function for print: divides the printable page among runners,
 * derives font size from row height, and enforces no-overlap constraints.
 */
export function computeRacePrintMetrics(runnerCount: number): RacePrintMetrics {
  const n = Math.max(runnerCount, 1);
  const pageContentHeightPx = A4_HEIGHT_PX - 2 * PAGE_MARGIN_PX;

  // Iterate: overhead scales with font, font scales with row height.
  let overheadPx = estimateRaceOverheadPx(14);
  let rowsAreaPx = pageContentHeightPx - overheadPx;
  let rowHeightPx = rowsAreaPx / n;
  let fit = fitFontAndLineHeight(rowHeightPx);

  for (let i = 0; i < 6; i++) {
    const nextOverhead = estimateRaceOverheadPx(fit.fontSizePx);
    if (nextOverhead === overheadPx) break;
    overheadPx = nextOverhead;
    rowsAreaPx = pageContentHeightPx - overheadPx;
    rowHeightPx = rowsAreaPx / n;
    fit = fitFontAndLineHeight(rowHeightPx);
  }

  const tagFontSizePx = Math.max(6.5, fit.fontSizePx * 0.72);

  return {
    fontSizePx: fit.fontSizePx,
    rowHeightPx: round1(rowHeightPx),
    rowsAreaPx: round1(rowsAreaPx),
    overheadPx,
    tagFontSizePx: round1(tagFontSizePx),
    cellPaddingPx: ROW_PADDING_PX,
    lineHeight: fit.lineHeight,
    pageContentHeightPx,
    totalRaceHeightPx: round1(overheadPx + rowsAreaPx),
  };
}
