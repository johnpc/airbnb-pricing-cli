import { FunctionTool, JSONValue } from '@strands-agents/sdk';

export const sendSMS = new FunctionTool({
  name: 'send_sms',
  description: 'Send SMS notification with pricing action items',
  inputSchema: {
    type: 'object',
    properties: {
      message: { type: 'string', description: 'SMS message body' },
    },
    required: ['message'],
  },
  callback: async (input: unknown): Promise<JSONValue> => {
    const { message } = input as { message: string };
    const apiKey = process.env.TEXTBELT_API_KEY;
    const phone = process.env.TEXTBELT_PHONE;

    if (!apiKey || !phone) {
      return { success: false, error: 'SMS credentials not configured' };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message, key: apiKey }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const text = await response.text();
      if (!text) {
        return { success: false, error: 'Empty response from TextBelt' };
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result: JSONValue = JSON.parse(text);
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, error: 'TextBelt timeout (10s)' };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
