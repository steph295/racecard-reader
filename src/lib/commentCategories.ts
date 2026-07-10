import type { RunnerDTO } from "@/lib/types";

/** Steward-facing horse comment buckets shown in Quick filters. */
export const HORSE_COMMENT_CATEGORIES = [
  "Behavioral",
  "Welfare",
  "Loading",
  "Equipment",
  "Interference",
] as const;

export type HorseCommentCategory = (typeof HORSE_COMMENT_CATEGORIES)[number];

/** External team sources we don't surface in horse comments (no "Other teams" column). */
const OTHER_TEAM_PATTERN =
  /^(vets?|starters?|clerk|handicapper|starter report|clerk of the course)/i;

/**
 * Maps a parsed report item to a horse-comment bucket. Returns null for
 * comments that belong to other teams and should be ignored entirely.
 */
export function horseCommentCategory(category: string, detail: string): HorseCommentCategory | null {
  const combined = `${category} ${detail}`.toLowerCase();

  if (OTHER_TEAM_PATTERN.test(category.trim())) return null;

  if (/welfare|vet|sampled|tested|lame|bleed|post-race check|heart/i.test(combined)) return "Welfare";
  if (/stewards|enquiry|interference|bump|collision|hamper/i.test(combined)) return "Interference";
  if (/load|stall|late|start|parade|mount/i.test(combined)) return "Loading";
  if (/blink|tongue|cheek|visor|hood|headgear|gear|equipment|bit/i.test(combined)) return "Equipment";
  if (/rider|jockey|behavior|run|travel|pace|hang/i.test(combined)) return "Behavioral";

  // Residual trainer/steward notes default to Behavioral rather than other teams.
  if (/trainer|note/i.test(category.toLowerCase())) return "Behavioral";

  return "Behavioral";
}

/** Count horse-comment items per bucket across a meeting (for filter panel). */
export function countHorseCommentCategories(runners: RunnerDTO[]): { category: HorseCommentCategory; count: number }[] {
  const counts = new Map<HorseCommentCategory, number>();
  for (const cat of HORSE_COMMENT_CATEGORIES) counts.set(cat, 0);

  for (const runner of runners) {
    for (const report of runner.reports) {
      for (const item of report.items) {
        const bucket = horseCommentCategory(item.category, item.detail);
        if (bucket) counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
      }
    }
  }

  return HORSE_COMMENT_CATEGORIES.map((category) => ({
    category,
    count: counts.get(category) ?? 0,
  })).filter((o) => o.count > 0);
}
