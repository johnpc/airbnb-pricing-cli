import 'dotenv/config';

const apiKey = process.env.PRICELABS_API_KEY;
if (!apiKey) {
  console.error('Error: PRICELABS_API_KEY not set in .env');
  process.exit(1);
}

console.log('Fetching all listings...\n');

const response = await fetch('https://api.pricelabs.co/v1/listings', {
  method: 'GET',
  headers: {
    accept: 'application/json',
    'X-API-Key': apiKey,
  },
});

const data = await response.json();
console.log(JSON.stringify(data, null, 2));
