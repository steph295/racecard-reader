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
  const races = await extractSilksFromPdf(bytes);
  mkdirSync(outDir, { recursive: true });
  let total = 0;
  races.forEach((race, r) => {
    console.log(`race group ${r + 1}: ${race.length} silks, nos = ${race.map((s) => s.no).join(",")}`);
    race.forEach((silk) => {
      const b64 = silk.dataUri.split(",")[1];
      writeFileSync(
        `${outDir}/race${r + 1}-no${silk.no ?? "x"}.png`,
        Buffer.from(b64, "base64")
      );
      total++;
    });
  });
  console.log("Wrote", total, "PNGs to", outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
