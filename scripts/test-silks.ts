/** Dev utility: extract silks from a PDF and dump PNGs for inspection. */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { extractSilksFromPdf } from "../src/lib/parsing/extractSilks";

async function main() {
  const pdfPath = process.argv[2];
  const outDir = process.argv[3] ?? "/tmp/silk-test";
  if (!pdfPath) {
    console.error("Usage: tsx scripts/test-silks.ts <racecard.pdf> [outDir]");
    process.exit(1);
  }
  const bytes = new Uint8Array(readFileSync(pdfPath));
  const silks = await extractSilksFromPdf(bytes);
  console.log("Extracted", silks.length, "silk images");
  mkdirSync(outDir, { recursive: true });
  silks.forEach((uri, i) => {
    const b64 = uri.split(",")[1];
    writeFileSync(`${outDir}/silk-${String(i).padStart(2, "0")}.png`, Buffer.from(b64, "base64"));
  });
  console.log("Wrote", silks.length, "PNGs to", outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
