import { FunctionTool, JSONValue } from '@strands-agents/sdk';

interface UniversityEvent {
  date: string;
  event: string;
  impact: string;
}

export const getGraduationDates = new FunctionTool({
  name: 'get_graduation_dates',
  description:
    'Get University of Michigan commencement and major academic events from official calendar',
  inputSchema: {
    type: 'object',
    properties: {
      days: { type: 'number', description: 'Number of days to look ahead' },
    },
    required: ['days'],
  },
  callback: async (input: unknown): Promise<JSONValue> => {
    const { days } = input as { days: number };

    // Fetch from UMich academic calendar iCal feed
    const response = await fetch(
      'https://calendar.google.com/calendar/ical/ro-academic%40umich.edu/public/basic.ics'
    );
    const ical = await response.text();

    const events: UniversityEvent[] = [];
    const eventBlocks = ical.split('BEGIN:VEVENT');

    for (const block of eventBlocks) {
      if (!block.includes('DTSTART')) continue;

      const summaryMatch = block.match(/SUMMARY:(.*)/);
      const dateMatch = block.match(/DTSTART;VALUE=DATE:(\d{8})/);

      if (!summaryMatch || !dateMatch) continue;

      const summary = summaryMatch[1].trim();
      const dateStr = dateMatch[1];
      const date = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;

      // High-impact events for pricing
      if (summary.toLowerCase().includes('commencement')) {
        events.push({
          date,
          event: summary,
          impact: 'massive (+75-100%)',
        });
      } else if (
        summary.toLowerCase().includes('move-in') ||
        summary.toLowerCase().includes('welcome week')
      ) {
        events.push({
          date,
          event: summary,
          impact: 'high (+40-50%)',
        });
      }
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    return events
      .filter(
        (event) =>
          new Date(event.date) <= cutoff && new Date(event.date) >= new Date()
      )
      .sort((a, b) => a.date.localeCompare(b.date)) as unknown as JSONValue;
  },
});
