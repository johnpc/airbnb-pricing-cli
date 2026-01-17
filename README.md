# ADU Pricing CLI

AI-powered dynamic pricing optimizer for Ann Arbor short-term rentals. Uses real-time market data and local events to generate data-driven pricing recommendations.

## What It Does

This tool analyzes your rental pricing against:
- **Market comparables** - Percentile pricing from similar listings in your area
- **Local events** - Michigan sports games, graduation, city festivals
- **Current pricing** - Your existing rates from PriceLabs

It then generates specific pricing recommendations like:
- "Raise May 1-3 to $400 (Spring Commencement, market 75th percentile is $350)"
- "Lower Feb 10-12 to $180 (no events, currently priced above market median)"

## Setup

### Prerequisites
- Node.js 18+
- PriceLabs account with API access enabled
- Your listing must have "Sync Prices" enabled in PriceLabs

### Installation

```bash
npm install
cp .env.example .env
```

Edit `.env` with your credentials:
```bash
PRICELABS_API_KEY=your_api_key_here
PRICELABS_LISTING_ID=your_listing_id_here

# AWS (for Bedrock)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here

# Optional: SMS notifications
TEXTBELT_API_KEY=your_textbelt_api_key_here
TEXTBELT_PHONE=+1234567890
```

**Getting your PriceLabs credentials:**
1. Go to PriceLabs Account Settings → API Details
2. Click "Enable" and choose "I Need API Access"
3. Copy your API key
4. Find your listing ID in the PriceLabs dashboard URL or via the API

**Enable sync in PriceLabs:**
1. Go to your listing in PriceLabs
2. Toggle "Sync Prices" to ON
3. Click "Sync Now" to perform initial sync
4. Wait 5-10 minutes for API access to activate

**Optional: SMS notifications via TextBelt:**
1. Sign up at [textbelt.com](https://textbelt.com)
2. Get your API key from the dashboard
3. Add `TEXTBELT_API_KEY` and `TEXTBELT_PHONE` to `.env`
4. Agent will send SMS alerts when pricing recommendations are generated

### Build

```bash
npm run build
npm run prepare  # Set up git hooks
```

## Usage

### One-time analysis
```bash
npm run analyze
```

### Test individual tools
```bash
node tool-test-scripts/test-football-schedule.ts
node tool-test-scripts/test-graduation-dates.ts
node tool-test-scripts/test-city-events.ts
node tool-test-scripts/test-current-pricing.ts
node tool-test-scripts/test-comps.ts
```

### Development
```bash
npm run build    # Compile TypeScript
npm run lint     # Run ESLint
npm run format   # Format with Prettier
```

### Weekly cron (Docker)
```bash
docker build -t adu-pricing .
docker run --env-file .env adu-pricing
```

## How It Works

### Tools

The AI agent uses five specialized tools to gather pricing intelligence:

#### 1. `get_football_schedule`
- **Source:** Michigan Athletics official RSS feed
- **Data:** Football, basketball, and hockey home games
- **Input:** `{ days: number }` - Days to look ahead
- **Output:** Game dates with opponents and impact levels
- **Impact:** 
  - Football: +30-60% (rival games +75-100%)
  - Basketball/Hockey: +15-25% (rival games +30-40%)

#### 2. `get_graduation_dates`
- **Source:** University of Michigan academic calendar (iCal feed)
- **Data:** Commencement ceremonies and move-in dates
- **Input:** `{ days: number }` - Days to look ahead
- **Output:** Event dates with impact levels
- **Impact:** +75-100% for commencement weekends

#### 3. `get_city_events`
- **Source:** Calculated from known annual event patterns
- **Data:** Ann Arbor Art Fair, Hash Bash, Summer Festival
- **Input:** `{ days: number }` - Days to look ahead
- **Output:** Event dates with impact levels
- **Impact:** +40-60% for major city events

#### 4. `get_current_pricing`
- **Source:** PriceLabs API
- **Data:** Your current pricing for upcoming dates
- **Input:** `{ listingId: string, dateFrom?: string, dateTo?: string }`
- **Output:** Array of dates with current prices
- **Purpose:** Baseline for comparison and adjustment recommendations

#### 5. `get_comparable_listings`
- **Source:** PriceLabs Neighborhood Data API
- **Data:** Market percentile prices (25th, 50th, 75th, 90th), occupancy rates, booking trends
- **Input:** `{ listingId: string, pms?: string }`
- **Output:** Comprehensive market statistics for your area
- **Purpose:** Understand competitive positioning and market rates

### Agent Behavior

The agent follows this decision-making process:

1. **Gather market context** - Fetch comparable listings to understand market rates
2. **Identify events** - Check for sports games, graduation, and city events in the target date range
3. **Analyze current pricing** - Compare your rates against market percentiles
4. **Calculate recommendations** - Apply event impact modifiers to market-based pricing
5. **Generate specific actions** - Provide date-specific price recommendations with reasoning

**Example reasoning:**
```
Date: May 1-3, 2026
Market 50th percentile: $220
Market 75th percentile: $280
Event: Spring Commencement (massive impact +75-100%)
Current price: $250
Recommendation: Raise to $400-450 (75th percentile + commencement premium)
```

### Pricing Strategy

The agent uses a **market-informed, event-adjusted** approach:

- **Base pricing:** Stay within market range (25th-90th percentile) - never the cheapest or most expensive
- **Dynamic positioning:** Shift percentile target based on events:
  - No events: 50th percentile (median)
  - Moderate events (basketball/hockey): 60th-65th percentile
  - High events (Art Fair, city festivals): 70th-75th percentile
  - Massive events (football vs rival, commencement): 75th-85th percentile
- **Competitive positioning:** Considers your occupancy vs market occupancy
- **Conservative adjustments:** Recommends changes in 10-20% increments to avoid shocking guests

**Example:**
```
Market: 25th=$150, 50th=$200, 75th=$280, 90th=$350

No events → $200 (50th percentile)
Basketball game → $230 (60th percentile)
Art Fair → $280 (75th percentile)
OSU Football → $315 (80th percentile, between 75th-90th)
```

## Expected Results

### What You'll Get
- Specific date ranges with recommended prices
- Reasoning for each recommendation (event, market data, current price)
- Confidence levels based on data quality
- Warnings about potential issues (low occupancy, pricing above market, etc.)

### What to Expect
- **Accuracy:** Recommendations based on real market data and confirmed events
- **Frequency:** Run weekly or before major event seasons
- **Manual review:** Always review recommendations before applying
- **Learning curve:** Agent improves as you provide feedback on what works

### Limitations
- Does not account for your specific booking patterns or guest preferences
- Cannot predict last-minute demand spikes or cancellations
- Market data depends on PriceLabs data quality for your area
- Event impacts are estimates based on typical patterns

## Troubleshooting

### "Listing sync is not toggled ON in PriceLabs"
1. Log into PriceLabs
2. Find your listing and toggle "Sync Prices" to ON
3. Click "Sync Now"
4. Wait 5-10 minutes for API to recognize the change

### Empty results from event tools
- Tools only return future events
- If testing in off-season, results may be empty
- Check tool-test-scripts to verify tools are working

### "PRICELABS_API_KEY not set"
- Ensure `.env` file exists in project root
- Check that API key is correctly copied (no extra spaces)
- Verify API access is enabled in PriceLabs account settings

## Contributing

```bash
npm run lint     # Check code style
npm run format   # Auto-format code
npm test         # Run tests (when added)
```

## License

MIT

---

## Notes for LLMs

**Development Philosophy:**
- This project uses real API data only - no mock data or placeholders
- All tools must connect to actual data sources (PriceLabs API, RSS feeds, iCal feeds)
- If an API is unavailable, the tool should return empty results or error, not fake data
- Test scripts verify real API responses, not mocked behavior
