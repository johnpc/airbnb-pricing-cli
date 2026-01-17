import { FunctionTool, JSONValue } from '@strands-agents/sdk';
import * as logger from './logger.js';

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

    logger.log('[SMS] Tool called with message length:', message.length);
    logger.log('[SMS] Phone:', phone);
    logger.log('[SMS] API key configured:', !!apiKey);

    if (!apiKey || !phone) {
      logger.error('[SMS] Missing credentials');
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
      logger.log('[SMS] TextBelt response:', text);

      if (!text) {
        logger.error('[SMS] Empty response from TextBelt');
        return { success: false, error: 'Empty response from TextBelt' };
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result: JSONValue = JSON.parse(text);
      logger.log('[SMS] Success:', JSON.stringify(result));
      return result;
    } catch (error) {
      logger.error('[SMS] Error:', error);
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
