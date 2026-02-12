export interface SubscriptionStatus {
  isActive: boolean;
  plan: string;
  notesUsed: number;
  noteLimit: number | null;
  summariesUsed: number;
  summaryLimit: number | null;
  billingCycle: string;
  lastReset: string;
  source?: string | null;
  stripeSubscriptionId?: string | null;
}

export interface SubscriptionInfo {
  plan: string;
  remaining: number | null;
  used: number;
  limit: number | null;
  isActive: boolean;
  canCreateNotes: boolean;
  isPremium: boolean;
  billingCycle: string;
  source: string | null;
  summariesUsed: number;
  summaryLimit: number | null;
}
