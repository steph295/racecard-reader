const PLACEHOLDER_PALETTE = [
  "#c0392b", "#2a6fdb", "#1f8a5b", "#a0522d", "#6a3fd1", "#b8860b",
  "#0f766e", "#7c3aed", "#b45309", "#0369a1", "#be185d", "#4b5563",
];

/**
 * Real silks are stored under /public/silks/{key}.png. Horses without a
 * matched silk (most real-world uploads, until you wire up real silk
 * artwork/lookup) get a generated colour-coded initial, same as the
 * prototype's placeholder logic.
 */
export function getSilkUrl(silkAssetKey: string | null, name: string, indexInRace: number): string {
  if (silkAssetKey) return `/silks/${silkAssetKey}.png`;

  const color = PLACEHOLDER_PALETTE[indexInRace % PLACEHOLDER_PALETTE.length];
  const initial = name ? name[0] : "?";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'><rect width='56' height='56' rx='14' fill='${color}'/><text x='28' y='36' font-family='Helvetica,Arial,sans-serif' font-size='24' font-weight='800' fill='#fff' text-anchor='middle'>${initial}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
