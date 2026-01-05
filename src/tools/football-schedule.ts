import { FunctionTool, JSONValue } from '@strands-agents/sdk';

interface SportsGame {
  date: string;
  opponent: string;
  home: boolean;
  location: string;
  sport: string;
  impact: string;
}

export const getFootballSchedule = new FunctionTool({
  name: 'get_football_schedule',
  description:
    'Get Michigan home sports game dates (football, basketball, hockey) with pricing impact levels from official athletics RSS feed',
  inputSchema: {
    type: 'object',
    properties: {
      days: { type: 'number', description: 'Number of days to look ahead' },
    },
    required: ['days'],
  },
  callback: async (input: unknown): Promise<JSONValue> => {
    const { days } = input as { days: number };

    // Fetch from Michigan Athletics RSS feed
    const response = await fetch(
      'https://mgoblue.com/api/v2/Calendar/subscribe?sport=5&type=rss'
    );
    const xml = await response.text();

    // Define sports to track with their impact levels
    const sportsImpact: Record<string, string> = {
      'Michigan Football': 'massive (+30-60%)',
      "Michigan Men's Basketball": 'moderate (+15-25%)',
      "Michigan Women's Basketball": 'small (+10-15%)',
      'Michigan Ice Hockey': 'moderate (+15-25%)',
    };

    // Parse XML for sports games
    const games: SportsGame[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const matches = xml.matchAll(itemRegex);

    for (const match of matches) {
      const item = match[1];
      const titleMatch = item.match(/<title>(.*?)<\/title>/);

      if (!titleMatch) continue;

      // Check if this is one of our tracked sports
      const sport = Object.keys(sportsImpact).find((s) =>
        titleMatch[1].includes(s)
      );
      if (!sport) continue;

      const dateMatch = item.match(
        /<s:localstartdate>(.*?)<\/s:localstartdate>/
      );
      const locationMatch = item.match(/<ev:location>(.*?)<\/ev:location>/);
      const opponentMatch = item.match(/<s:opponent>(.*?)<\/s:opponent>/);

      if (dateMatch && locationMatch && opponentMatch) {
        const date = dateMatch[1].split('T')[0];
        const location = locationMatch[1];
        const opponent = opponentMatch[1];
        const isHome = location.includes('Ann Arbor');

        // Check for rival games
        const isRival =
          opponent.includes('Ohio State') ||
          opponent.includes('Michigan State');
        let impact = sportsImpact[sport];

        if (isRival) {
          impact =
            sport === 'Michigan Football'
              ? 'massive rival (+75-100%)'
              : impact
                  .replace('moderate', 'high')
                  .replace('small', 'moderate')
                  .replace('+15-25%', '+30-40%')
                  .replace('+10-15%', '+20-25%');
        }

        games.push({
          date,
          opponent,
          home: isHome,
          location,
          sport: sport.replace('Michigan ', ''),
          impact,
        });
      }
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    return games.filter(
      (game) => game.home && new Date(game.date) <= cutoff
    ) as unknown as JSONValue;
  },
});
