/**
 * Extracts jockey-silk artwork from a racecard PDF.
 *
 * Silks in these PDFs are vector drawings (not embedded images): each one is
 * a dense cluster of small paths in a roughly square ~47x47pt box. Strategy:
 *
 *   1. Walk each page's operator list tracking the transform stack, and
 *      cluster small path bounding boxes into silk-sized groups.
 *   2. Render the whole page once to a canvas (@napi-rs/canvas, which pdfjs
 *      uses natively in Node), then crop each cluster out as a PNG.
 *
 * Returns PNG data URIs in reading order (page, top-to-bottom). Racecards
 * list silks in saddlecloth order, so the Nth silk belongs to the Nth runner.
 */

import { createCanvas } from "@napi-rs/canvas";

type Matrix = [number, number, number, number, number, number];

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

function multiply(a: Matrix, b: Matrix): Matrix {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

function transformPoint(m: Matrix, x: number, y: number) {
  return { x: m[0] * x + m[2] * y + m[4], y: m[1] * x + m[3] * y + m[5] };
}

interface Box {
  x: number;
  y: number; // from top of page, in PDF units
  w: number;
  h: number;
}

interface Cluster {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  n: number;
}

/** Groups small path boxes into clusters; silks are dense clusters of paths. */
function clusterSilkBoxes(boxes: Box[]): Cluster[] {
  const small = boxes.filter((b) => b.w <= 50 && b.h <= 50);
  const clusters: Cluster[] = [];
  for (const b of small) {
    const hit = clusters.find(
      (c) => b.x >= c.x1 - 6 && b.x + b.w <= c.x2 + 6 && b.y >= c.y1 - 6 && b.y + b.h <= c.y2 + 6
    );
    if (hit) {
      hit.x1 = Math.min(hit.x1, b.x);
      hit.y1 = Math.min(hit.y1, b.y);
      hit.x2 = Math.max(hit.x2, b.x + b.w);
      hit.y2 = Math.max(hit.y2, b.y + b.h);
      hit.n++;
    } else {
      clusters.push({ x1: b.x, y1: b.y, x2: b.x + b.w, y2: b.y + b.h, n: 1 });
    }
  }

  return clusters.filter((c) => {
    const w = c.x2 - c.x1;
    const h = c.y2 - c.y1;
    if (c.n < 5 || w < 20 || h < 20 || w > 90 || h > 90) return false;
    const ratio = w / h;
    return ratio > 0.6 && ratio < 1.7;
  });
}

const RENDER_SCALE = 2; // 47pt silk -> ~94px crop, plenty for a 44px display size

export async function extractSilksFromPdf(bytes: Uint8Array): Promise<string[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "pdfjs-dist/legacy/build/pdf.worker.mjs";

  const doc = await pdfjs.getDocument({
    // pdfjs *transfers* (detaches) the underlying ArrayBuffer to its worker,
    // so it must get a private copy - the caller's bytes are typically shared
    // with the text-extraction pass, which has already detached its buffer.
    data: bytes.slice(),
    useWorkerFetch: false,
    disableFontFace: true,
    isOffscreenCanvasSupported: false,
    isImageDecoderSupported: false,
  }).promise;
  const OPS = pdfjs.OPS;

  const silks: string[] = [];

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const pageHeight = page.view[3] - page.view[1];
    const opList = await page.getOperatorList();

    let ctm = IDENTITY;
    const stack: Matrix[] = [];
    const boxes: Box[] = [];

    for (let i = 0; i < opList.fnArray.length; i++) {
      const fn = opList.fnArray[i];
      const args = opList.argsArray[i];
      if (fn === OPS.save) {
        stack.push(ctm);
      } else if (fn === OPS.restore) {
        ctm = stack.pop() ?? IDENTITY;
      } else if (fn === OPS.transform) {
        ctm = multiply(ctm, args as Matrix);
      } else if (fn === OPS.constructPath) {
        // args[2] is the path's [minX, minY, maxX, maxY] in current user space.
        const minMax = args?.[2] as ArrayLike<number> | undefined;
        if (!minMax || minMax.length < 4) continue;
        const p1 = transformPoint(ctm, minMax[0], minMax[1]);
        const p2 = transformPoint(ctm, minMax[2], minMax[3]);
        const x = Math.min(p1.x, p2.x);
        const yBottom = Math.min(p1.y, p2.y);
        const w = Math.abs(p2.x - p1.x);
        const h = Math.abs(p2.y - p1.y);
        boxes.push({ x, y: pageHeight - (yBottom + h), w, h });
      }
    }

    const clusters = clusterSilkBoxes(boxes);
    if (clusters.length === 0) continue;
    clusters.sort((a, b) => a.y1 - b.y1 || a.x1 - b.x1);

    // Render the page once, then crop each silk cluster out of it.
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const pageCanvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    await page.render({
      // @napi-rs/canvas implements the HTMLCanvasElement surface pdfjs needs.
      canvas: pageCanvas as unknown as HTMLCanvasElement,
      viewport,
    }).promise;

    for (const c of clusters) {
      const pad = 2 * RENDER_SCALE;
      const sx = Math.max(0, c.x1 * RENDER_SCALE - pad);
      const sy = Math.max(0, c.y1 * RENDER_SCALE - pad);
      const sw = Math.min(pageCanvas.width - sx, (c.x2 - c.x1) * RENDER_SCALE + pad * 2);
      const sh = Math.min(pageCanvas.height - sy, (c.y2 - c.y1) * RENDER_SCALE + pad * 2);
      if (sw <= 0 || sh <= 0) continue;

      const crop = createCanvas(Math.ceil(sw), Math.ceil(sh));
      const ctx = crop.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, crop.width, crop.height);
      ctx.drawImage(pageCanvas, sx, sy, sw, sh, 0, 0, sw, sh);
      silks.push(`data:image/png;base64,${crop.toBuffer("image/png").toString("base64")}`);
    }
  }

  return silks;
}
