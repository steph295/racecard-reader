import type { RunnerDTO } from "@/lib/types";

/**
 * Runner-level search filter, shared between the race card and filter panel
 * "Showing X of N" count.
 */
export function filterRunners(runners: RunnerDTO[], search: string): RunnerDTO[] {
  const term = search.trim().toLowerCase();
  if (!term) return runners;
  return runners.filter(
    (h) =>
      h.name.toLowerCase().includes(term) ||
      (h.jockey ?? "").toLowerCase().includes(term) ||
      (h.trainer ?? "").toLowerCase().includes(term)
  );
}
