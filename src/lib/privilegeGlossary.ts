export type PrivilegeTier = "must" | "good";

export interface StewardPrivilege {
  tier: PrivilegeTier;
  label: string;
  abbr: string;
}

/** Canonical steward privileges — the only tags shown in the UI or filters. */
export const STEWARD_PRIVILEGES: Record<string, StewardPrivilege> = {
  RH: { tier: "must", label: "Red hood", abbr: "RH" },
  E: { tier: "must", label: "Early to post", abbr: "E" },
  MC: { tier: "must", label: "Mounting at start", abbr: "MC" },
  FW: { tier: "must", label: "Wisp in front", abbr: "FW" },
  B1: { tier: "must", label: "Blinkers first time", abbr: "B1" },
  TT: { tier: "good", label: "Tongue tie", abbr: "TT" },
  CP: { tier: "good", label: "Cheekpieces", abbr: "CP" },
  V: { tier: "good", label: "Visor", abbr: "V" },
  H: { tier: "good", label: "Hood", abbr: "H" },
  WITS: { tier: "good", label: "Withdrawn if tongue strap", abbr: "WITS" },
  HP: { tier: "good", label: "Hood in parade ring", abbr: "HP" },
  "Ear out": { tier: "good", label: "Earplugs out", abbr: "Ear out" },
  "Ear in": { tier: "good", label: "Earplugs in", abbr: "Ear in" },
  LR: { tier: "good", label: "Loading with rug", abbr: "LR" },
  SR: { tier: "good", label: "Starters report", abbr: "SR" },
};

/** Default long-name labels for steward privilege abbreviations. */
export const DEFAULT_TAG_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(STEWARD_PRIVILEGES).map(([tag, { label }]) => [tag, label])
);

export interface PrivilegeGlossaryEntry {
  label: string;
  abbr: string;
}

export type PrivilegeGlossary = Record<string, PrivilegeGlossaryEntry>;

export function defaultGlossaryEntry(tag: string): PrivilegeGlossaryEntry {
  const steward = STEWARD_PRIVILEGES[tag];
  if (steward) return { label: steward.label, abbr: steward.abbr };
  return { label: tag, abbr: tag };
}

export function glossaryLabel(glossary: PrivilegeGlossary, tag: string): string {
  return glossary[tag]?.label ?? defaultGlossaryEntry(tag).label;
}

export function glossaryAbbr(glossary: PrivilegeGlossary, tag: string): string {
  return glossary[tag]?.abbr ?? defaultGlossaryEntry(tag).abbr;
}

export function loadPrivilegeGlossary(meetingId: string): PrivilegeGlossary {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`rc-priv-glossary-${meetingId}`);
    return raw ? (JSON.parse(raw) as PrivilegeGlossary) : {};
  } catch {
    return {};
  }
}

export function savePrivilegeGlossary(meetingId: string, glossary: PrivilegeGlossary) {
  localStorage.setItem(`rc-priv-glossary-${meetingId}`, JSON.stringify(glossary));
}
