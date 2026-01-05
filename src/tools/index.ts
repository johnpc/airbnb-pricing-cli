import { Tool } from '@strands-agents/sdk';
import { getFootballSchedule } from './football-schedule.js';
import { getGraduationDates } from './graduation-dates.js';
import { getCityEvents } from './city-events.js';
import { getCurrentPricing } from './current-pricing.js';
import { getComps } from './comps.js';
import { getCompetitors } from './competitors.js';
import { getHolidays } from './holidays.js';
import { sendSMS } from '../notify.js';

export function loadTools(): Tool[] {
  return [
    getFootballSchedule,
    getGraduationDates,
    getCityEvents,
    getCurrentPricing,
    getComps,
    getCompetitors,
    getHolidays,
    sendSMS,
  ];
}
