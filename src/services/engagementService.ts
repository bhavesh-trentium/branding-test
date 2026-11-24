import type { BrandingState, EngagementAction } from '@/types/branding';
import { ENGAGEMENT_ACTIONS } from '@/constants/branding';

export function applyEngagementAction(state: BrandingState, action: EngagementAction, now = new Date()): BrandingState {
  const config = ENGAGEMENT_ACTIONS.find((item) => item.id === action);
  if (!config) throw new Error(`Unknown engagement action: ${action}`);

  const completed = action === 'goalCompleted';
  const activeToday = action === 'activeToday' || completed;
  const dayOffset = action === 'missedOneDay' ? 1 : action === 'missedThreeDays' ? 3 : action === 'missedSevenDays' ? 7 : 0;
  const lastActivity = activeToday ? now : new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);

  return {
    ...state,
    variant: config.variant,
    engagement: action,
    lastActivityAt: lastActivity.toISOString(),
    updatedAt: now.toISOString(),
    streak: completed ? Math.max(state.streak, 1) : activeToday ? state.streak + 1 : 0,
    dailyProgress: completed ? 1 : activeToday ? Math.max(state.dailyProgress, 0.72) : 0,
  };
}
