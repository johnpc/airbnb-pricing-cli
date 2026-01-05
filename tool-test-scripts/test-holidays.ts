import { getHolidays } from '../dist/tools/holidays.js';

console.log('Testing holidays tool...\n');

const result = await getHolidays._callback({ days: 365 });
console.log('Result:', JSON.stringify(result, null, 2));
