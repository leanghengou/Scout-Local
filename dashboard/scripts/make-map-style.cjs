const fs = require('fs');
const src = process.argv[2], dst = process.argv[3];
const s = JSON.parse(fs.readFileSync(src, 'utf8'));
// Palette matched to the reference screenshot (pale gray, white streets, mint parks, periwinkle major road).
const C = {
  background: '#eceef2',
  park: '#b9e9c8',
  wood: '#b9e9c8',
  water: '#c9d6ea',
  waterway: '#b3c6e2',
  residential: '#e3e6eb',
  building: '#d8dce3',
  buildingOutline: '#cdd2db',
  motorwayCasing: '#8fa3d9',
  motorwayInner: '#a9b8e6',
  majorCasing: '#dfe2e7',
  majorInner: '#ffffff',
  minor: '#ffffff',
  railway: '#d0d5de',
  boundary: '#9aa6c4',
};
const set = (id, paint) => {
  const l = s.layers.find((x) => x.id === id);
  if (!l) { console.warn('missing layer', id); return; }
  Object.assign(l.paint, paint);
};
set('background', { 'background-color': C.background });
set('park', { 'fill-color': C.park });
set('landcover_wood', { 'fill-color': C.wood });
set('water', { 'fill-color': C.water });
set('waterway', { 'line-color': C.waterway });
set('landuse_residential', { 'fill-color': C.residential });
set('building', { 'fill-color': C.building, 'fill-outline-color': C.buildingOutline });
for (const id of ['tunnel_motorway_casing', 'highway_motorway_casing', 'highway_motorway_bridge_casing'])
  set(id, { 'line-color': C.motorwayCasing });
for (const id of ['tunnel_motorway_inner', 'highway_motorway_inner', 'highway_motorway_bridge_inner', 'highway_motorway_subtle'])
  set(id, { 'line-color': C.motorwayInner });
set('highway_major_casing', { 'line-color': C.majorCasing });
set('highway_major_inner', { 'line-color': C.majorInner });
set('highway_minor', { 'line-color': C.minor });
for (const id of ['railway', 'railway_transit', 'railway_service']) set(id, { 'line-color': C.railway });
for (const id of ['boundary_2', 'boundary_3', 'boundary_disputed']) set(id, { 'line-color': C.boundary });
// Hide building footprints until zoom 16 (show them only when zoomed in close).
const BUILDING_MIN_ZOOM = 16;
for (const id of ['building']) { const l = s.layers.find((x) => x.id === id); if (l) l.minzoom = BUILDING_MIN_ZOOM; }
fs.writeFileSync(dst, JSON.stringify(s));
console.log('wrote', dst, s.layers.length, 'layers');
