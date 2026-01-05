import 'dotenv/config';
import { getComps } from '../dist/tools/comps.js';

const listingId = process.env.PRICELABS_LISTING_ID;
if (!listingId) {
  console.error('Error: PRICELABS_LISTING_ID not set in .env');
  process.exit(1);
}

console.log('Testing comps tool with retries...');
console.log('Listing ID:', listingId);

for (let i = 1; i <= 5; i++) {
  console.log(`\nAttempt ${i}/5...`);
  try {
    const result = await getComps._callback({ listingId, pms: 'airbnb' });
    console.log('✓ Success!');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.log(`✗ Failed: ${error.message}`);
    if (i < 5) {
      console.log('Waiting 30 seconds...');
      await new Promise((resolve) => setTimeout(resolve, 30000));
    }
  }
}

console.log(
  '\nAll attempts failed. The API may need more time or additional setup.'
);
