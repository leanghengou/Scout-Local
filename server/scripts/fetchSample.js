import 'dotenv/config';
import { writeFile, mkdir } from 'node:fs/promises';

const FIELDS = [
  'places.id', 'places.displayName', 'places.formattedAddress',
  'places.nationalPhoneNumber', 'places.websiteUri', 'places.googleMapsUri',
  'places.rating', 'places.userRatingCount', 'places.businessStatus',
  'places.regularOpeningHours', 'places.location', 'places.types',
].join(',');

const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
    'X-Goog-FieldMask': FIELDS,
  },
  body: JSON.stringify({ textQuery: 'hair salons in Montreal', pageSize: 20 }),
});

const data = await res.json();
if (!res.ok) {
  console.error(data);
  process.exit(1);
}

await mkdir('src/mocks', { recursive: true });
await writeFile('src/mocks/places-sample.json', JSON.stringify(data, null, 2));
console.log(`Saved ${data.places?.length ?? 0} places to src/mocks/places-sample.json`);