import 'dotenv/config';
import { getComps } from '../dist/tools/comps.js';

const listingId = process.env.PRICELABS_LISTING_ID;
if (!listingId) {
  console.error('Error: PRICELABS_LISTING_ID not set in .env');
  process.exit(1);
}

console.log('Testing comps tool...');
console.log('Listing ID:', listingId);
console.log('API Key set:', !!process.env.PRICELABS_API_KEY);

// Access the callback directly from the FunctionTool
const result = await getComps._callback({ listingId, pms: 'airbnb' });
console.log('\nResult:', JSON.stringify(result, null, 2));
