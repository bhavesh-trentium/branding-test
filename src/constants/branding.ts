import type { BrandingState, BrandingVariant, EngagementAction } from '@/types/branding';

export const BRANDING_VARIANTS: Array<{
  id: BrandingVariant;
  name: string;
  description: string;
  color: string;
  mood: string;
}> = [
  { id: 'default', name: 'Default', description: 'Your calm starting point.', color: '#7465E8', mood: '◉' },
  { id: 'happy', name: 'Happy', description: 'A little momentum goes a long way.', color: '#F4A641', mood: '✦' },
  { id: 'sleepy', name: 'Sleepy', description: 'A gentle nudge after a quiet day.', color: '#6C89B8', mood: '☾' },
  { id: 'sad', name: 'Sad', description: 'A soft reminder to come back.', color: '#637286', mood: '·' },
  { id: 'celebration', name: 'Celebration', description: 'A small win deserves a moment.', color: '#E96855', mood: '✹' },
];

export const ENGAGEMENT_ACTIONS: Array<{
  id: EngagementAction;
  title: string;
  detail: string;
  variant: BrandingVariant;
}> = [
  { id: 'activeToday', title: 'Active today', detail: 'Keep the momentum going', variant: 'happy' },
  { id: 'missedOneDay', title: 'Missed 1 day', detail: 'A gentle return prompt', variant: 'sleepy' },
  { id: 'missedThreeDays', title: 'Missed 3 days', detail: 'A quieter check-in', variant: 'sad' },
  { id: 'missedSevenDays', title: 'Missed 7 days', detail: 'A soft invitation back', variant: 'sad' },
  { id: 'goalCompleted', title: 'Daily goal complete', detail: 'Celebrate the progress', variant: 'celebration' },
];

export const INITIAL_STATE: BrandingState = {
  variant: 'default',
  engagement: 'activeToday',
  lastActivityAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  streak: 4,
  dailyProgress: 0.62,
  appName: 'BrandLab',
  theme: 'system',
};

export const APP_NAME_OPTIONS = ['BrandLab', 'BrandLab Active', 'BrandLab Focus', 'BrandLab Celebration'];

export function getVariant(id: BrandingVariant) {
  return BRANDING_VARIANTS.find((item) => item.id === id) ?? BRANDING_VARIANTS[0];
}
