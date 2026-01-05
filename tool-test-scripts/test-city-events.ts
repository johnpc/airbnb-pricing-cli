import { getCityEvents } from '../dist/tools/city-events.js';

console.log('Testing city events tool...\n');

const result = await getCityEvents._callback({});
console.log('Result:', JSON.stringify(result, null, 2));
