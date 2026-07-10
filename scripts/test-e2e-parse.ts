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

  const [extraction, silkRaces] = await Promise.all([
    structureRaceMeeting(text),
    extractSilksFromPdf(silkBytes),
  ]);

  console.log("races:", extraction.races.length, "| silk groups:", silkRaces.length);
  let attached = 0;
  let total = 0;
  extraction.races.forEach((race, raceIdx) => {
    const raceSilks = silkRaces[raceIdx] ?? [];
    const matched = race.runners.filter((r) => raceSilks.some((s) => s.no === r.no)).length;
    attached += matched;
    total += race.runners.length;
    console.log(
      `  race ${raceIdx + 1} (${race.time}): ${race.runners.length} runners, ` +
        `${raceSilks.length} silks (nos ${raceSilks.map((s) => s.no).join(",")}), matched ${matched}`
    );
  });
  console.log(`TOTAL matched by saddlecloth number: ${attached}/${total}`);
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
