import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AttributionControl, MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { LatLng, Pair } from '../../lib/geo';

export type MapMarker = {
  key: string;
  lat: number;
  lng: number;
  /** Trusted HTML built by the screen (names escaped with esc()). Drawn with its anchor at the point. */
  html: string;
  title?: string;
  z?: number;
  onClick?: () => void;
};

export type MapLine = {
  key: string;
  points: Pair[];
  color: string;
  weight: number;
  opacity?: number;
  dash?: string;
  className?: string;
};

/** Move the map when `key` changes: fit these points, or fly to a centre. */
export type MapView =
  | { key: string | number; fit: Pair[]; padding: [number, number, number, number]; maxZoom?: number }
  | { key: string | number; center: LatLng; zoom?: number };

type Props = {
  center: LatLng;
  zoom?: number;
  markers?: MapMarker[];
  lines?: MapLine[];
  view?: MapView | null;
  /** Called after the user pans or zooms (not after programmatic moves). */
  onMoveEnd?: (c: LatLng, zoom: number) => void;
  /** Where the OSM attribution sits (px from the top), clear of the screen's own controls. */
  attributionTop?: number;
  label?: string;
};

// Tiles (TECH_DESIGN §3). Production MUST set VITE_MAP_TILE_URL to a provider with a key
// (MapTiler, Stadia, Carto); the OSM public server is for development only under its usage policy.
const TILE_URL = (import.meta.env.VITE_MAP_TILE_URL as string | undefined) || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  (import.meta.env.VITE_MAP_TILE_ATTRIBUTION as string | undefined) ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const icon = (html: string) => L.divIcon({ html, className: 'pe-pin', iconSize: [0, 0], iconAnchor: [0, 0] });

function Pin({ m }: { m: MapMarker }) {
  const ic = useMemo(() => icon(m.html), [m.html]);
  const handlers = useMemo(() => (m.onClick ? { click: m.onClick, keypress: m.onClick } : undefined), [m.onClick]);
  return (
    <Marker
      position={[m.lat, m.lng]}
      icon={ic}
      zIndexOffset={m.z ?? 0}
      eventHandlers={handlers}
      title={m.title}
      alt={m.title}
      keyboard={!!m.onClick}
      interactive={!!m.onClick}
    />
  );
}

function ViewControl({ view, onMoveEnd }: { view?: MapView | null; onMoveEnd?: Props['onMoveEnd'] }) {
  const map = useMap();
  const programmatic = useRef(false);
  const lastKey = useRef<string | number | null>(null);

  useEffect(() => {
    if (!view || view.key === lastKey.current) return;
    lastKey.current = view.key;
    programmatic.current = true;
    if ('fit' in view) {
      if (view.fit.length === 0) return;
      const [t, r, b, l] = view.padding;
      if (view.fit.length === 1) {
        // Centre the point in the area the overlays leave visible, not behind the bottom sheet.
        map.setView(view.fit[0], view.maxZoom ?? 15, { animate: false });
        map.panBy([(r - l) / 2, (b - t) / 2], { animate: false });
      }
      else map.fitBounds(L.latLngBounds(view.fit), { paddingTopLeft: [l, t], paddingBottomRight: [r, b], maxZoom: view.maxZoom ?? 16, animate: true });
    } else {
      map.flyTo([view.center.lat, view.center.lng], view.zoom ?? map.getZoom(), { duration: 0.6 });
    }
  }, [map, view]);

  useMapEvents({
    moveend: () => {
      if (programmatic.current) {
        programmatic.current = false;
        return;
      }
      const c = map.getCenter();
      onMoveEnd?.({ lat: c.lat, lng: c.lng }, map.getZoom());
    },
  });
  return null;
}

/** The one map component (TECH_DESIGN §3): Leaflet + OSM tiles; layers are passed in as data. */
export default function MapCanvas({ center, zoom = 14, markers = [], lines = [], view, onMoveEnd, attributionTop = 0, label = 'Map' }: Props) {
  return (
    <div className="pe-map" role="region" aria-label={label} style={{ position: 'absolute', inset: 0, zIndex: 0, ['--pe-attr-top' as string]: `${attributionTop}px` }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        zoomControl={false}
        attributionControl={false}
        style={{ position: 'absolute', inset: 0, background: 'var(--map-bg)' }}
        preferCanvas={false}
      >
        <AttributionControl position="topright" prefix={false} />
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={19} detectRetina={false} />
        {lines.map((l) => (
          <Polyline
            key={l.key}
            positions={l.points}
            pathOptions={{ color: l.color, weight: l.weight, opacity: l.opacity ?? 1, dashArray: l.dash, lineCap: 'round', lineJoin: 'round', className: l.className, interactive: false }}
          />
        ))}
        {markers.map((m) => (
          <Pin key={m.key} m={m} />
        ))}
        <ViewControl view={view} onMoveEnd={onMoveEnd} />
      </MapContainer>
    </div>
  );
}
