/**
 * Parses an ORC stall/loading privileges sheet (the "ORCB..." export that
 * courses send trainers' declared privileges in). Despite the .xls extension
 * it's an HTML document containing one <table>: a title row, a header row,
 * then one row per horse with Yes/No flag columns and free-text columns.
 *
 * Each horse's privileges are condensed to abbreviated flags plus any free
 * text, e.g. "WPF, RH, FED — Blind for stalls entry".
 */

export interface PrivilegeEntry {
  horseName: string;
  privileges: string;
}

/** Header substring (lowercased) -> abbreviation shown on the racecard. */
const FLAG_ABBREVIATIONS: [string, string][] = [
  ["late load", "LL"],
  ["staff to be at the start", "AS"],
  ["start early", "ES"],
  ["any plate is shed", "WP"],
  ["foreleg is shed", "WPF"],
  ["red hood", "RH"],
  ["tongue strap", "TS"],
  ["ear plugs which should be removed", "EP"],
  ["ear plugs throughout", "EPR"],
  ["hood in the parade ring", "HPR"],
  ["mounted in the chute", "MC"],
  ["fed while stabled", "FED"],
];

const FREE_TEXT_HEADERS = ["special requirements", "further privileges"];

function stripTags(fragment: string): string {
  return fragment
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseHtmlRows(html: string): string[][] {
  const noScripts = html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, "");
  const rowMatches = noScripts.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
  return rowMatches.map((row) => {
    const cells = row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) ?? [];
    return cells.map(stripTags);
  });
}

export function parsePrivilegesSheet(html: string): PrivilegeEntry[] {
  const rows = parseHtmlRows(html);

  const headerIdx = rows.findIndex(
    (r) => r.some((c) => /^horse$/i.test(c)) && r.some((c) => /race\s*time/i.test(c))
  );
  if (headerIdx === -1) {
    throw new Error(
      "Couldn't find the header row in this sheet - expected an ORC privileges export with 'Race Time' and 'Horse' columns."
    );
  }

  const header = rows[headerIdx].map((h) => h.toLowerCase());
  const horseCol = header.findIndex((h) => h === "horse");

  const flagCols: { col: number; abbr: string }[] = [];
  for (const [needle, abbr] of FLAG_ABBREVIATIONS) {
    const col = header.findIndex((h) => h.includes(needle));
    if (col !== -1) flagCols.push({ col, abbr });
  }
  const freeTextCols = FREE_TEXT_HEADERS
    .map((needle) => header.findIndex((h) => h.includes(needle)))
    .filter((col) => col !== -1);

  const entries: PrivilegeEntry[] = [];
  for (const row of rows.slice(headerIdx + 1)) {
    const horseName = row[horseCol];
    if (!horseName) continue;

    const flags = flagCols
      .filter(({ col }) => /^yes$/i.test(row[col] ?? ""))
      .map(({ abbr }) => abbr);
    const freeText = freeTextCols
      .map((col) => (row[col] ?? "").trim())
      .filter(Boolean)
      .join("; ");

    let privileges = flags.join(", ");
    if (freeText) privileges = privileges ? `${privileges} — ${freeText}` : freeText;
    if (!privileges) continue;

    entries.push({ horseName, privileges });
  }

  return entries;
}
