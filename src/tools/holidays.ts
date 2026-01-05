import { FunctionTool, JSONValue } from '@strands-agents/sdk';

interface Holiday {
  date: string;
  holiday: string;
  impact: string;
}

function getEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function getThanksgiving(year: number): Date {
  const nov = new Date(year, 10, 1);
  let thursdays = 0;
  while (thursdays < 4) {
    if (nov.getDay() === 4) thursdays++;
    if (thursdays < 4) nov.setDate(nov.getDate() + 1);
  }
  return nov;
}

function getMemorialDay(year: number): Date {
  const may = new Date(year, 4, 31);
  while (may.getDay() !== 1) {
    may.setDate(may.getDate() - 1);
  }
  return may;
}

function getLaborDay(year: number): Date {
  const sep = new Date(year, 8, 1);
  while (sep.getDay() !== 1) {
    sep.setDate(sep.getDate() + 1);
  }
  return sep;
}

export const getHolidays = new FunctionTool({
  name: 'get_holidays',
  description:
    "Get major holidays when people travel home (Christmas, New Years, Easter, Thanksgiving, Memorial Day, Labor Day, 4th of July, Halloween, Valentine's Day)",
  inputSchema: {
    type: 'object',
    properties: {
      days: { type: 'number', description: 'Number of days to look ahead' },
    },
    required: ['days'],
  },
  callback: (input: unknown): JSONValue => {
    const { days } = input as { days: number };
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);

    const holidays: Holiday[] = [];
    const currentYear = today.getFullYear();
    const nextYear = currentYear + 1;

    for (const year of [currentYear, nextYear]) {
      const yearHolidays = [
        {
          date: new Date(year, 0, 1),
          name: 'New Years Day',
          impact: 'high (+40-60%)',
        },
        {
          date: new Date(year, 1, 14),
          name: "Valentine's Day",
          impact: 'moderate (+20-35%)',
        },
        {
          date: getEaster(year),
          name: 'Easter Weekend',
          impact: 'moderate (+20-35%)',
        },
        {
          date: getMemorialDay(year),
          name: 'Memorial Day',
          impact: 'high (+40-60%)',
        },
        {
          date: new Date(year, 6, 4),
          name: '4th of July',
          impact: 'high (+40-60%)',
        },
        {
          date: getLaborDay(year),
          name: 'Labor Day',
          impact: 'high (+40-60%)',
        },
        {
          date: new Date(year, 9, 31),
          name: 'Halloween',
          impact: 'moderate (+20-35%)',
        },
        {
          date: getThanksgiving(year),
          name: 'Thanksgiving',
          impact: 'high (+40-60%)',
        },
        {
          date: new Date(year, 11, 24),
          name: 'Christmas Eve',
          impact: 'high (+40-60%)',
        },
        {
          date: new Date(year, 11, 25),
          name: 'Christmas',
          impact: 'high (+40-60%)',
        },
        {
          date: new Date(year, 11, 31),
          name: 'New Years Eve',
          impact: 'high (+40-60%)',
        },
      ];

      for (const holiday of yearHolidays) {
        if (holiday.date >= today && holiday.date <= endDate) {
          holidays.push({
            date: holiday.date.toISOString().split('T')[0],
            holiday: holiday.name,
            impact: holiday.impact,
          });
        }
      }
    }

    return holidays.sort((a, b) =>
      a.date.localeCompare(b.date)
    ) as unknown as JSONValue;
  },
});
