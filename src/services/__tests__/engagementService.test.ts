import { INITIAL_STATE } from '@/constants/branding';
import { applyEngagementAction } from '@/services/engagementService';

describe('applyEngagementAction', () => {
  const now = new Date('2026-11-23T10:30:00.000Z');

  it.each([
    ['activeToday', 'happy'],
    ['missedOneDay', 'sleepy'],
    ['missedThreeDays', 'sad'],
    ['missedSevenDays', 'sad'],
    ['goalCompleted', 'celebration'],
  ] as const)('maps %s to %s', (action, variant) => {
    const result = applyEngagementAction({ ...INITIAL_STATE }, action, now);
    expect(result.variant).toBe(variant);
    expect(result.updatedAt).toBe(now.toISOString());
  });

  it('sets complete progress for a completed goal', () => {
    const result = applyEngagementAction({ ...INITIAL_STATE }, 'goalCompleted', now);
    expect(result.dailyProgress).toBe(1);
    expect(result.lastActivityAt).toBe(now.toISOString());
  });

  it('sets the simulated last activity timestamp for an inactive day', () => {
    const result = applyEngagementAction({ ...INITIAL_STATE }, 'missedThreeDays', now);
    expect(result.lastActivityAt).toBe('2026-11-20T10:30:00.000Z');
    expect(result.dailyProgress).toBe(0);
  });
});
