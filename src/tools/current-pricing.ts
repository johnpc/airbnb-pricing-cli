import { FunctionTool, JSONValue } from '@strands-agents/sdk';

export const getCurrentPricing = new FunctionTool({
  name: 'get_current_pricing',
  description: 'Get current pricing for the next 90 days',
  inputSchema: {
    type: 'object',
    properties: {
      listingId: { type: 'string', description: 'Listing ID' },
      dateFrom: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD), optional',
      },
      dateTo: {
        type: 'string',
        description: 'End date (YYYY-MM-DD), optional',
      },
    },
    required: ['listingId'],
  },
  callback: async (input: unknown): Promise<JSONValue> => {
    const { listingId, dateFrom, dateTo } = input as {
      listingId: string;
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
      listings: [{ id: listingId, pms: 'airbnb' }],
    };

    if (dateFrom && dateTo) {
      body.listings[0].dateFrom = dateFrom;
      body.listings[0].dateTo = dateTo;
    }

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
