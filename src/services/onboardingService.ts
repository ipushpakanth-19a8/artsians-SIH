import { resolveApiUrl } from '../lib/nativeBridge';

export interface OnboardingStatusResponse {
  success: boolean;
  hasCompletedBuyerOnboarding: boolean;
  message?: string;
}

/**
 * Persist the buyer onboarding completion flag to the database.
 */
export async function setBuyerOnboardingComplete(token: string): Promise<boolean> {
  try {
    const res = await fetch(resolveApiUrl('/api/users/onboarding'), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ hasCompletedBuyerOnboarding: true }),
    });

    if (!res.ok) {
      console.warn('Backend returned non-ok status for buyer onboarding update:', res.status);
      return false;
    }

    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.error('Error updating buyer onboarding status:', err);
    return false;
  }
}

/**
 * Check if the buyer has completed onboarding according to the current session or backend.
 */
export function checkNeedsBuyerOnboarding(user: { hasCompletedBuyerOnboarding?: boolean; role?: string | null } | null): boolean {
  if (!user || user.role !== 'buyer') {
    return false;
  }
  return user.hasCompletedBuyerOnboarding !== true;
}
