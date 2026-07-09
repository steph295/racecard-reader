/** Dev utility: full parse pipeline (text + AI structuring + silks) offline. */
import "dotenv/config";
import { readFileSync } from "fs";
import { extractTextFromPdf } from "../src/lib/parsing/extractText";
import { extractSilksFromPdf } from "../src/lib/parsing/extractSilks";
import { structureRaceMeeting } from "../src/lib/parsing/structure";

async function main() {
  const bytes = new Uint8Array(readFileSync(process.argv[2]));
  const silkBytes = bytes.slice();

  const text = await extractTextFromPdf(bytes);
  console.log("text length:", text.length);

  const [extraction, silks] = await Promise.all([
    structureRaceMeeting(text),
    extractSilksFromPdf(silkBytes),
  ]);

  const runners = extraction.races.flatMap((r) => r.runners);
  console.log("races:", extraction.races.length);
  console.log("runners:", runners.length);
  console.log("silks:", silks.length);
  console.log(runners.length === silks.length ? "MATCH - silks will attach" : "MISMATCH - silks would be skipped!");
  extraction.races.forEach((r, i) => console.log(`  race ${i + 1} (${r.time}): ${r.runners.length} runners`));
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
