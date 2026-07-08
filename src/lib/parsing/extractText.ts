import Papa from "papaparse";

/**
 * pdfjs-dist references DOMMatrix at module load even in its legacy Node
 * build. Node.js has no DOMMatrix, so provide a minimal 2D implementation -
 * we only extract text (no page rendering), so full matrix fidelity is
 * never exercised beyond basic transforms.
 */
function installDomMatrixPolyfill() {
  if (typeof (globalThis as Record<string, unknown>).DOMMatrix !== "undefined") return;

  class DOMMatrixPolyfill {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;

    constructor(init?: string | number[]) {
      if (Array.isArray(init) && init.length >= 6) {
        [this.a, this.b, this.c, this.d, this.e, this.f] = init;
      }
    }

    get is2D() { return true; }
    get isIdentity() {
      return this.a === 1 && this.b === 0 && this.c === 0 &&
             this.d === 1 && this.e === 0 && this.f === 0;
    }

    multiplySelf(other: DOMMatrixPolyfill) {
      const { a, b, c, d, e, f } = this;
      this.a = a * other.a + c * other.b;
      this.b = b * other.a + d * other.b;
      this.c = a * other.c + c * other.d;
      this.d = b * other.c + d * other.d;
      this.e = a * other.e + c * other.f + e;
      this.f = b * other.e + d * other.f + f;
      return this;
    }

    multiply(other: DOMMatrixPolyfill) {
      return new DOMMatrixPolyfill([this.a, this.b, this.c, this.d, this.e, this.f]).multiplySelf(other);
    }

    translateSelf(tx = 0, ty = 0) {
      this.e += this.a * tx + this.c * ty;
      this.f += this.b * tx + this.d * ty;
      return this;
    }

    translate(tx = 0, ty = 0) {
      return new DOMMatrixPolyfill([this.a, this.b, this.c, this.d, this.e, this.f]).translateSelf(tx, ty);
    }

    scaleSelf(sx = 1, sy = sx) {
      this.a *= sx; this.b *= sx;
      this.c *= sy; this.d *= sy;
      return this;
    }

    scale(sx = 1, sy = sx) {
      return new DOMMatrixPolyfill([this.a, this.b, this.c, this.d, this.e, this.f]).scaleSelf(sx, sy);
    }

    invertSelf() {
      const { a, b, c, d, e, f } = this;
      const det = a * d - b * c;
      if (!det) { this.a = this.b = this.c = this.d = this.e = this.f = NaN; return this; }
      this.a = d / det;
      this.b = -b / det;
      this.c = -c / det;
      this.d = a / det;
      this.e = (c * f - d * e) / det;
      this.f = (b * e - a * f) / det;
      return this;
    }

    inverse() {
      return new DOMMatrixPolyfill([this.a, this.b, this.c, this.d, this.e, this.f]).invertSelf();
    }

    transformPoint(point: { x: number; y: number }) {
      return {
        x: this.a * point.x + this.c * point.y + this.e,
        y: this.b * point.x + this.d * point.y + this.f,
      };
    }

    toFloat32Array() {
      return new Float32Array([this.a, this.b, 0, 0, this.c, this.d, 0, 0, 0, 0, 1, 0, this.e, this.f, 0, 1]);
    }

    toFloat64Array() {
      return new Float64Array([this.a, this.b, 0, 0, this.c, this.d, 0, 0, 0, 0, 1, 0, this.e, this.f, 0, 1]);
    }
  }

  (globalThis as Record<string, unknown>).DOMMatrix = DOMMatrixPolyfill;
}

/**
 * Pulls raw text out of an uploaded racecard PDF, page by page, preserving
 * rough left-to-right/top-to-bottom reading order. This text is then handed
 * to the LLM structuring step (see structure.ts) - we deliberately don't try
 * to hand-roll layout/column detection here, since racecard PDFs vary wildly
 * between providers (Racing Post, At The Races, Timeform, ...).
 */
export async function extractTextFromPdf(bytes: Uint8Array): Promise<string> {
  installDomMatrixPolyfill();
  // Dynamic import + the legacy Node build: avoids pulling in DOM-only APIs
  // (canvas, DOMMatrix, Worker) that the default browser build expects.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // No web worker in a Node API route - pdfjs falls back to a "fake worker"
  // on the main thread, but it still needs a resolvable module path here.
  pdfjs.GlobalWorkerOptions.workerSrc = "pdfjs-dist/legacy/build/pdf.worker.mjs";

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
