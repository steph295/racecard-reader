import type { RunnerDTO } from "@/lib/types";
import { privilegesToTags } from "@/lib/privilegeTags";

/**
 * The runner-level filters (search + privileges facet), shared between the
 * race card rendering and the filter panel's "Showing X of N" count so the
 * two can never disagree.
 */
export function filterRunners(
  runners: RunnerDTO[],
  search: string,
  privilegeFilter: string[] | null
): RunnerDTO[] {
  const term = search.trim().toLowerCase();
  let list = runners;
  if (term) {
    list = list.filter(
      (h) =>
        h.name.toLowerCase().includes(term) ||
        (h.jockey ?? "").toLowerCase().includes(term) ||
        (h.trainer ?? "").toLowerCase().includes(term)
    );
  }
  if (privilegeFilter) {
    list = list.filter((h) => privilegesToTags(h.privileges).some((t) => privilegeFilter.includes(t)));
  }
  return list;
}
