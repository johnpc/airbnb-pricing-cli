import 'dotenv/config';
import { getCompetitors } from '../dist/tools/competitors.js';

console.log('Testing competitors tool...');
console.log('API Key set:', !!process.env.PRICELABS_API_KEY);

const result = await getCompetitors._callback({});
console.log('\nResult:', JSON.stringify(result, null, 2));
