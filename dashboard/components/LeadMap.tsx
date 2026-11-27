'use client';

import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect } from 'react';
import { MapContainer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { setWorkerUrl } from 'maplibre-gl';

// Colored copy of OpenFreeMap "positron" (street names, no shop/POI icons).
// Generated into public/ from the Positron style with tweaked colors.
const BASEMAP_STYLE = '/map-style.json';

// Served from public/ (copied from node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs).
setWorkerUrl('/maplibre-gl-worker.mjs');

export type Lead = {
  googlePlaceId: string;
  name: string;
  address: string;
  website: string | null;
  rating: number | null;
  reviewCount: number;
  leadScore: number;
  lat: number;
  lng: number;
};

function scoreColor(score: number) {
  if (score >= 60) return '#dc2626';
  if (score >= 30) return '#f59e0b';
  return '#16a34a';
}

function Basemap() {
  const map = useMap();

  useEffect(() => {
    const layer = maplibreGL({ style: BASEMAP_STYLE }).addTo(map);
    map.attributionControl.addAttribution('&copy; OpenStreetMap contributors');
    return () => {
      layer.remove();
    };
  }, [map]);

  return null;
}

export default function LeadMap({ leads }: { leads: Lead[] }) {
  return (
    <MapContainer
     center={[45.5019, -73.5674]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      <Basemap />
      {leads.map((lead) => (
        <CircleMarker
          key={lead.googlePlaceId}
          center={[lead.lat, lead.lng]}
          radius={8}
          pathOptions={{ color: scoreColor(lead.leadScore), fillOpacity: 0.8 }}
        >
          <Popup>
            <strong>{lead.name}</strong>
            <br />
            {lead.address}
            <br />
            Score: {lead.leadScore} · {lead.website ? 'Has website' : 'No website'}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
