/** Dev utility: parse an ORC privileges sheet and print the extracted entries. */
import { readFileSync } from "fs";
import { parsePrivilegesSheet } from "../src/lib/parsing/parsePrivileges";

const path = process.argv[2];
if (!path) {
  console.error("Usage: tsx scripts/test-privileges.ts <sheet.xls>");
  process.exit(1);
}

const entries = parsePrivilegesSheet(readFileSync(path, "utf8"));
console.log(`${entries.length} horses with privileges:`);
for (const e of entries) {
  console.log(`  ${e.horseName}: ${e.privileges}`);
}
