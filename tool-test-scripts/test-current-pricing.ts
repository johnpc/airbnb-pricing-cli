import 'dotenv/config';
import { getCurrentPricing } from '../dist/tools/current-pricing.js';

const listingId = process.env.PRICELABS_LISTING_ID;
if (!listingId) {
  console.error('Error: PRICELABS_LISTING_ID not set in .env');
  process.exit(1);
}

console.log('Testing current pricing tool...');
console.log('Listing ID:', listingId);
console.log('API Key set:', !!process.env.PRICELABS_API_KEY);

const result = await getCurrentPricing._callback({ listingId });
console.log('\nResult:', JSON.stringify(result, null, 2));
