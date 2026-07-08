const PLACEHOLDER_PALETTE = [
  "#c0392b", "#2a6fdb", "#1f8a5b", "#a0522d", "#6a3fd1", "#b8860b",
  "#0f766e", "#7c3aed", "#b45309", "#0369a1", "#be185d", "#4b5563",
];

/**
 * Priority: silk artwork extracted from the uploaded PDF (a data URI), then
 * bundled assets under /public/silks/{key}.png, then a generated
 * colour-coded initial as a last resort.
 */
export function getSilkUrl(
  silkImage: string | null,
  silkAssetKey: string | null,
  name: string,
  indexInRace: number
): string {
  if (silkImage) return silkImage;
  if (silkAssetKey) return `/silks/${silkAssetKey}.png`;

  const color = PLACEHOLDER_PALETTE[indexInRace % PLACEHOLDER_PALETTE.length];
  const initial = name ? name[0] : "?";
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'><rect width='56' height='56' rx='14' fill='${color}'/><text x='28' y='36' font-family='Helvetica,Arial,sans-serif' font-size='24' font-weight='800' fill='#fff' text-anchor='middle'>${initial}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
