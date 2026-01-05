import { FunctionTool, JSONValue } from '@strands-agents/sdk';

export const getComps = new FunctionTool({
  name: 'get_comparable_listings',
  description:
    'Get pricing data from comparable listings in the neighborhood (percentile prices, occupancy, market stats)',
  inputSchema: {
    type: 'object',
    properties: {
      listingId: { type: 'string', description: 'Listing ID' },
      pms: {
        type: 'string',
        description: 'Property management system (e.g., airbnb, vrbo, vrm)',
        default: 'airbnb',
      },
    },
    required: ['listingId'],
  },
  callback: async (input: unknown): Promise<JSONValue> => {
    const { listingId, pms = 'airbnb' } = input as {
      listingId: string;
      pms?: string;
    };

    const apiKey = process.env.PRICELABS_API_KEY;
    if (!apiKey) throw new Error('PRICELABS_API_KEY not set');

    const response = await fetch(
      `https://api.pricelabs.co/v1/neighborhood_data?pms=${pms}&listing_id=${listingId}`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'X-API-Key': apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PriceLabs API error: ${error}`);
    }
    return (await response.json()) as JSONValue;
  },
});
