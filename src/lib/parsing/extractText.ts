import Papa from "papaparse";

/**
 * Pulls raw text out of an uploaded racecard PDF, page by page, preserving
 * rough left-to-right/top-to-bottom reading order. This text is then handed
 * to the LLM structuring step (see structure.ts) - we deliberately don't try
 * to hand-roll layout/column detection here, since racecard PDFs vary wildly
 * between providers (Racing Post, At The Races, Timeform, ...).
 */
export async function extractTextFromPdf(bytes: Uint8Array): Promise<string> {
  // Dynamic import + the legacy Node build: avoids pulling in DOM-only APIs
  // (canvas, DOMMatrix, Worker) that the default browser build expects.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // No web worker in a Node API route - run parsing on the main thread.
  pdfjs.GlobalWorkerOptions.workerSrc = "";

  const doc = await pdfjs.getDocument({
    data: bytes,
    useWorkerFetch: false,
    disableFontFace: true,
  }).promise;

  const pages: string[] = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(`--- page ${pageNum} ---\n${line}`);
  }
  void doc; // GC will reclaim this at the end of the request; explicit destroy() typing varies by build.
  return pages.join("\n\n");
}

/** CSV racecard exports: just normalize to a text table for the LLM step. */
export function extractTextFromCsv(text: string): string {
  const parsed = Papa.parse<string[]>(text.trim(), { skipEmptyLines: true });
  return parsed.data.map((row) => row.join(" | ")).join("\n");
}

export type UploadKind = "pdf" | "csv";

export function detectUploadKind(fileName: string, mimeType: string): UploadKind | null {
  const lower = fileName.toLowerCase();
  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (mimeType === "text/csv" || lower.endsWith(".csv")) return "csv";
  return null;
}
