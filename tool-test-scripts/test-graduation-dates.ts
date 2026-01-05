import { getGraduationDates } from '../dist/tools/graduation-dates.js';

console.log('Testing graduation dates tool...\n');

const result = await getGraduationDates._callback({});
console.log('Result:', JSON.stringify(result, null, 2));
