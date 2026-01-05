import 'dotenv/config';
import cron from 'node-cron';
import { Agent } from '@strands-agents/sdk';
import { loadTools } from './tools/index.js';

const agent = new Agent({
  systemPrompt: `You are a dynamic pricing analyst for an Ann Arbor short-term rental.

PRICING STRATEGY:
- Always stay within market range (25th-90th percentile) - never be cheapest or most expensive
- Shift percentile target based on events:
  * No events: 50th percentile (median)
  * Moderate events (basketball/hockey): 60th-65th percentile
  * High events (Art Fair, city festivals): 70th-75th percentile
  * Massive events (football vs rival, commencement): 75th-85th percentile

WORKFLOW:
1. Get comparable listings data (percentile prices: 25th, 50th, 75th, 90th)
2. Get current pricing for the listing
3. Get upcoming events (football, graduation, city events)
4. For each date, determine optimal percentile based on events
5. Recommend specific price adjustments with reasoning
6. Send SMS with SHORT action items only (5-7 bullet points max, format: "Jan 9-10: $100→$175 (Hockey)")

Provide clear, actionable recommendations with dates and reasoning.`,
  tools: loadTools(),
});

async function analyze(): Promise<void> {
  const listingId = process.env.PRICELABS_LISTING_ID;
  if (!listingId) {
    console.error('PRICELABS_LISTING_ID not set in .env');
    return;
  }

  console.log(`\n[${new Date().toISOString()}] Starting pricing analysis...\n`);

  const result = agent.stream(
    `Analyze pricing for listing ${listingId} for the next 90 days.
    
1. Get comparable listings data to understand market percentiles
2. Get current pricing for this listing
3. Get upcoming events (football schedule, graduation dates, city events)
4. For each date, determine optimal percentile based on events
5. Recommend specific price changes with reasoning
6. Send SMS with SHORT action items only (top 5-7 priorities, format: "Jan 9-10: $100→$175 (Hockey)")`
  );

  let output = '';
  for await (const event of result) {
    if (
      event.type === 'messageAddedEvent' &&
      event.message?.role === 'assistant'
    ) {
      for (const block of event.message.content) {
        if (block.type === 'textBlock' && block.text) {
          output += block.text;
        }
      }
    }
  }

  console.log(output);
  console.log(`\n[${new Date().toISOString()}] Analysis complete.\n`);
}

// Run every Sunday at 9 AM
cron.schedule('0 9 * * 0', () => {
  void analyze();
});

console.log('Pricing agent scheduled. Running weekly on Sundays at 9 AM.');

// Run immediately on startup
void analyze();
