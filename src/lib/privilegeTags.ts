/**
 * Converts stored privilege strings into the short abbreviated tags stewards
 * read at a glance under the horse name.
 *
 * Stored privileges look like "RH, FED — Blind for stalls entry": abbreviated
 * flags, then optional free text after an em dash. Both parts become tags -
 * flags pass through (re-mapped to the current scheme where needed), free
 * text is keyword-matched to the closest abbreviation or shortened to 3
 * characters.
 */

/** Canonical steward abbreviations, applied to free text by keyword. */
const KEYWORD_TAGS: [RegExp, string][] = [
  [/red\s*hood/i, "RH"],
  [/blinker/i, "B1"],
  [/tongue\s*(tie|strap)/i, "TT"],
  [/cheek\s*piece/i, "CP"],
  [/visor/i, "V"],
  [/wisp/i, "FW"],
  [/ear\s*plug.*(out|remov)/i, "EAR OUT"],
  [/ear\s*plug.*(in|throughout)/i, "EAR IN"],
  [/hood.*parade/i, "HP"],
  [/parade.*hood/i, "HP"],
  [/mount/i, "MC"],
  [/chute/i, "MC"],
  [/starter/i, "SR"],
  [/early/i, "E"],
  [/blind/i, "BLD"],
  [/stalls?\s*rug/i, "RUG"],
  [/saddl/i, "SAD"],
  [/load/i, "LD"],
  [/fed|feed/i, "FED"],
];

/** Legacy flag codes from earlier sheet uploads -> current scheme. */
const LEGACY_FLAG_MAP: Record<string, string> = {
  ES: "E",
  TS: "WITS",
  EP: "EAR OUT",
  EPR: "EAR IN",
  HPR: "HP",
};

function freeTextToTag(text: string): string {
  for (const [pattern, tag] of KEYWORD_TAGS) {
    if (pattern.test(text)) return tag;
  }
  const firstWord = text.trim().split(/\s+/)[0] ?? "";
  return firstWord.slice(0, 3).toUpperCase();
}

export function privilegesToTags(privileges: string | null): string[] {
  if (!privileges) return [];

  const [flagPart, ...freeParts] = privileges.split("—");
  const tags: string[] = [];

  // The part before the dash is a comma-separated flag list - unless the
  // whole string is free text (no known-flag shape), then treat it as such.
  const flagCandidates = flagPart
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
  const looksLikeFlags =
    freeParts.length > 0 ||
    flagCandidates.every((f) => /^[A-Za-z0-9]{1,4}$/.test(f) || /^Ear (in|out)$/i.test(f));

  if (looksLikeFlags) {
    for (const flag of flagCandidates) {
      const upper = flag.toUpperCase();
      tags.push(LEGACY_FLAG_MAP[upper] ?? upper);
    }
  } else {
    tags.push(freeTextToTag(flagPart));
  }

  for (const part of freeParts.join("—").split(";")) {
    const text = part.trim();
    if (text) tags.push(freeTextToTag(text));
  }

  return [...new Set(tags)];
}
