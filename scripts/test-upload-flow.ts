/** Dev utility: replicate the server's text-then-silks extraction sequence. */
import { readFileSync } from "fs";
import { extractTextFromPdf } from "../src/lib/parsing/extractText";
import { extractSilksFromPdf } from "../src/lib/parsing/extractSilks";

async function main() {
  const bytes = new Uint8Array(readFileSync(process.argv[2]));

  // Same order as processUpload: copy for silks BEFORE text extraction
  // detaches the original buffer.
  const silkBytes = bytes.slice();

  const text = await extractTextFromPdf(bytes);
  console.log("text length:", text.length);

  const silkRaces = await extractSilksFromPdf(silkBytes);
  console.log(
    "silks extracted:",
    silkRaces.reduce((n, r) => n + r.length, 0),
    "in",
    silkRaces.length,
    "race groups"
  );
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
