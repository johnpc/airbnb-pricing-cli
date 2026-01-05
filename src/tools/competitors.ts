import { FunctionTool, JSONValue } from '@strands-agents/sdk';

const COMPETITOR_LISTINGS = [
  { id: '1109726706765369360', pms: 'airbnb', name: 'Competitor 1' },
  { id: '1001328760901941093', pms: 'airbnb', name: 'Competitor 2' },
];

export const getCompetitors = new FunctionTool({
  name: 'get_competitor_pricing',
  description:
    'Get current pricing from specific competitor listings in the area',
  inputSchema: {
    type: 'object',
    properties: {
      dateFrom: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD), optional',
      },
      dateTo: {
        type: 'string',
        description: 'End date (YYYY-MM-DD), optional',
      },
    },
    required: [],
  },
  callback: async (input: unknown): Promise<JSONValue> => {
    const { dateFrom, dateTo } = input as {
      dateFrom?: string;
      dateTo?: string;
    };

    const apiKey = process.env.PRICELABS_API_KEY;
    if (!apiKey) throw new Error('PRICELABS_API_KEY not set');

    const body: {
      listings: Array<{
        id: string;
        pms: string;
        dateFrom?: string;
        dateTo?: string;
      }>;
    } = {
      listings: COMPETITOR_LISTINGS.map((comp) => ({
        id: comp.id,
        pms: comp.pms,
        ...(dateFrom && dateTo ? { dateFrom, dateTo } : {}),
      })),
    };

    const response = await fetch('https://api.pricelabs.co/v1/listing_prices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PriceLabs API error: ${error}`);
    }
    return (await response.json()) as JSONValue;
  },
});
