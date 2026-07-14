/**
 * Converts stored privilege strings into the short abbreviated tags stewards
 * read at a glance under the horse name.
 *
 * Only a curated steward whitelist is shown — garbage tokens from free-text
 * parsing (THE, IF, CRA, etc.) are dropped.
 */

import {
  type PrivilegeGlossary,
  type PrivilegeTier,
  STEWARD_PRIVILEGES,
  glossaryAbbr,
  glossaryLabel,
} from "@/lib/privilegeGlossary";

export type { PrivilegeTier };

const WHITELIST = new Set(Object.keys(STEWARD_PRIVILEGES));

const TIER_ORDER: Record<PrivilegeTier, number> = { must: 0, good: 1 };

/** Legacy / variant codes from sheet uploads and free text → canonical whitelist key. */
const ALIASES: Record<string, string> = {
  ES: "E",
  TS: "WITS",
  EP: "Ear out",
  "EAR OUT": "Ear out",
  "EAR IN": "Ear in",
  EPR: "Ear in",
  HPR: "HP",
  RUG: "LR",
  LD: "LR",
};

/** Free-text keyword patterns → canonical whitelist key (order matters). */
const KEYWORD_TAGS: [RegExp, string][] = [
  [/red\s*hood/i, "RH"],
  [/blinkers?\s*(first\s*time)?/i, "B1"],
  [/withdrawn.*tongue\s*strap/i, "WITS"],
  [/tongue\s*strap/i, "WITS"],
  [/tongue\s*tie/i, "TT"],
  [/cheek\s*piece/i, "CP"],
  [/visor/i, "V"],
  [/wisp/i, "FW"],
  [/ear\s*plug.*(out|remov)/i, "Ear out"],
  [/ear\s*plug.*(in|throughout)/i, "Ear in"],
  [/hood.*parade|parade.*hood/i, "HP"],
  [/mount|chute/i, "MC"],
  [/starter/i, "SR"],
  [/early(\s*to\s*post)?/i, "E"],
  [/(stalls?\s*)?rug|load.*rug|rug.*load/i, "LR"],
  [/\bhood\b/i, "H"],
];

function isWhitelisted(tag: string): boolean {
  return WHITELIST.has(tag);
}

function normalizeFlag(flag: string): string | null {
  const trimmed = flag.trim();
  if (!trimmed) return null;

  if (/^ear\s*out$/i.test(trimmed)) return "Ear out";
  if (/^ear\s*in$/i.test(trimmed)) return "Ear in";

  const upper = trimmed.toUpperCase();
  const alias = ALIASES[upper];
  if (alias) return alias;

  if (isWhitelisted(trimmed)) return trimmed;

  const caseMatch = [...WHITELIST].find((k) => k.toUpperCase() === upper);
  return caseMatch ?? null;
}

function freeTextToTag(text: string): string | null {
  for (const [pattern, tag] of KEYWORD_TAGS) {
    if (pattern.test(text)) return tag;
  }
  return null;
}

export function privilegeTier(tag: string): PrivilegeTier | null {
  return STEWARD_PRIVILEGES[tag]?.tier ?? null;
}

export function tagMeaning(tag: string, glossary?: PrivilegeGlossary): string {
  if (glossary) return glossaryLabel(glossary, tag);
  return STEWARD_PRIVILEGES[tag]?.label ?? tag;
}

export function displayTag(tag: string, glossary?: PrivilegeGlossary): string {
  if (glossary) return glossaryAbbr(glossary, tag);
  return STEWARD_PRIVILEGES[tag]?.abbr ?? tag;
}

export function sortPrivilegeTags(tags: string[]): string[] {
  return [...tags].sort((a, b) => {
    const ta = privilegeTier(a);
    const tb = privilegeTier(b);
    if (ta && tb && ta !== tb) return TIER_ORDER[ta] - TIER_ORDER[tb];
    return displayTag(a).localeCompare(displayTag(b));
  });
}

export function privilegesToTags(privileges: string | null): string[] {
  if (!privileges) return [];

  const [flagPart, ...freeParts] = privileges.split("—");
  const tags: string[] = [];

  const flagCandidates = flagPart
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
  const looksLikeFlags =
    freeParts.length > 0 ||
    flagCandidates.every((f) => /^[A-Za-z0-9]{1,6}$/.test(f) || /^Ear (in|out)$/i.test(f));

  if (looksLikeFlags) {
    for (const flag of flagCandidates) {
      const normalized = normalizeFlag(flag);
      if (normalized) tags.push(normalized);
    }
  } else {
    const fromText = freeTextToTag(flagPart);
    if (fromText) tags.push(fromText);
  }

  for (const part of freeParts.join("—").split(";")) {
    const text = part.trim();
    if (!text) continue;
    const fromText = freeTextToTag(text);
    if (fromText) tags.push(fromText);
  }

  return sortPrivilegeTags([...new Set(tags)]);
}
