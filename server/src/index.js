import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { readFile } from 'node:fs/promises';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PLACES_FIELDS = [
  'places.id', 'places.displayName', 'places.formattedAddress',
  'places.nationalPhoneNumber', 'places.websiteUri', 'places.googleMapsUri',
  'places.rating', 'places.userRatingCount', 'places.businessStatus',
  'places.regularOpeningHours', 'places.location', 'places.types',
].join(',');

// Placeholder scoring: businesses without a website score higher (better leads),
// and lower-rated businesses get a small bump. Adjust to your real criteria.
function scoreLead(place) {
  let score = place.websiteUri ? 20 : 70;
  if (typeof place.rating === 'number' && place.rating < 4) score += 10;
  return Math.min(100, score);
}

function toLead(place) {
  const website = place.websiteUri ?? null;
  return {
    googlePlaceId: place.id,
    name: place.displayName?.text ?? 'Unknown',
    address: place.formattedAddress ?? '',
    website,
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? 0,
    leadScore: scoreLead(place),
    lat: place.location?.latitude,
    lng: place.location?.longitude,
  };
}

async function fetchPlaces(query) {
  if (process.env.USE_MOCK_PLACES === 'true') {
    const raw = await readFile(new URL('./mocks/places-sample.json', import.meta.url), 'utf8');
    return JSON.parse(raw).places ?? [];
  }

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': PLACES_FIELDS,
    },
    body: JSON.stringify({ textQuery: query, pageSize: 20 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Places API ${res.status}: ${JSON.stringify(data)}`);
  return data.places ?? [];
}

app.post('/api/scans', async (req, res) => {
  const query = req.body?.query ?? 'hair salons in Toronto';
  try {
    const places = await fetchPlaces(query);
    const leads = places
      .filter((p) => typeof p.location?.latitude === 'number' && typeof p.location?.longitude === 'number')
      .map(toLead);
    res.json({ query, leads });
  } catch (err) {
    console.error('Scan failed:', err.message);
    res.status(500).json({ error: 'Scan failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});