const OSM_CREDIT = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

/** The credit each tile provider's terms require, picked from the tile address (VITE_MAP_TILE_ATTRIBUTION overrides). */
export function tileCredit(url: string, override?: string) {
  if (override) return override;
  if (url.includes('api.maptiler.com')) return `<a href="https://www.maptiler.com/copyright/" target="_blank" rel="noreferrer">&copy; MapTiler</a> ${OSM_CREDIT}`;
  if (url.includes('stadiamaps.com')) return `&copy; <a href="https://stadiamaps.com/" target="_blank" rel="noreferrer">Stadia Maps</a> ${OSM_CREDIT}`;
  if (url.includes('basemaps.cartocdn.com')) return `&copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a> ${OSM_CREDIT}`;
  return OSM_CREDIT;
}
