import { getFootballSchedule } from '../dist/tools/football-schedule.js';

console.log('Testing football schedule tool...\n');

const result = await getFootballSchedule._callback({});
console.log('Result:', JSON.stringify(result, null, 2));
