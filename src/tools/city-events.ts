import { FunctionTool, JSONValue } from '@strands-agents/sdk';

interface CityEvent {
  date: string;
  event: string;
  impact: string;
}

function getNthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  n: number
): Date {
  const date = new Date(year, month, 1);
  let count = 0;

  while (date.getMonth() === month) {
    if (date.getDay() === weekday) {
      count++;
      if (count === n) return new Date(date);
    }
    date.setDate(date.getDate() + 1);
  }

  return new Date(year, month, 1);
}

export const getCityEvents = new FunctionTool({
  name: 'get_city_events',
  description:
    'Get Ann Arbor city events (Art Fair, Hash Bash, Summer Festival) with pricing impact',
  inputSchema: {
    type: 'object',
    properties: {
      days: { type: 'number', description: 'Number of days to look ahead' },
    },
    required: ['days'],
  },
  callback: (input: unknown): JSONValue => {
    const { days } = input as { days: number };
    const events: CityEvent[] = [];
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    // Generate events for current and next year
    for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
      const year = now.getFullYear() + yearOffset;

      // Ann Arbor Art Fair - 3rd Wednesday-Saturday of July
      const artFairStart = getNthWeekdayOfMonth(year, 6, 3, 3); // 3rd Wednesday of July (month 6)
      for (let i = 0; i < 4; i++) {
        const date = new Date(artFairStart);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        events.push({
          date: dateStr,
          event: 'Ann Arbor Art Fair',
          impact: 'massive (+75-100%)',
        });
      }

      // Hash Bash - First Saturday of April
      const hashBash = getNthWeekdayOfMonth(year, 3, 6, 1); // 1st Saturday of April (month 3)
      events.push({
        date: hashBash.toISOString().split('T')[0],
        event: 'Hash Bash',
        impact: 'moderate (+20-30%)',
      });

      // Ann Arbor Summer Festival - June 13-29 (approximately)
      const summerFestStart = new Date(year, 5, 13); // June 13
      for (let i = 0; i < 17; i++) {
        const date = new Date(summerFestStart);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        events.push({
          date: dateStr,
          event: 'Ann Arbor Summer Festival',
          impact: 'moderate (+20-30%)',
        });
      }
    }

    return events
      .filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= now && eventDate <= cutoff;
      })
      .sort((a, b) => a.date.localeCompare(b.date)) as unknown as JSONValue;
  },
});
