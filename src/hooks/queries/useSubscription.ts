import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { subscriptionApi } from "../../api/endpoints/subscription";
import type { SubscriptionInfo, SubscriptionStatus } from "../../types/subscription";

const computeSubscriptionInfo = (
  status: SubscriptionStatus | null | undefined,
): SubscriptionInfo => {
  if (!status) {
    return {
      plan: "Free",
      remaining: 12,
      used: 0,
      limit: 12,
      isActive: false,
      canCreateNotes: true,
      isPremium: false,
      billingCycle: "monthly",
      source: null,
      summariesUsed: 0,
      summaryLimit: 6,
    };
  }

  const isUnlimited = status.noteLimit === null;
  const remaining = isUnlimited
    ? null
    : Math.max(0, (status.noteLimit as number) - status.notesUsed);
  const canCreateNotes = isUnlimited
    ? true
    : remaining !== null &&
      remaining > 0 &&
      (status.isActive || status.plan === "Free");
  const isPremium = status.isActive && status.plan !== "Free";

  return {
    plan: status.plan,
    remaining,
    used: status.notesUsed,
    limit: status.noteLimit,
    isActive: status.isActive,
    canCreateNotes,
    isPremium,
    billingCycle: status.billingCycle,
    source: status.source || null,
    summariesUsed: status.summariesUsed,
    summaryLimit: status.summaryLimit,
  };
};

export const useSubscriptionStatus = (enabled = true) => {
  return useQuery({
    queryKey: ["subscription", "status"],
    queryFn: subscriptionApi.getStatus,
    staleTime: 1000 * 60 * 2,
    enabled,
  });
};

export const useSubscriptionInfo = (enabled = true) => {
  const {
    data: subscriptionData,
    isLoading,
    error,
  } = useSubscriptionStatus(enabled);

  const subscriptionInfo = useMemo(
    () => computeSubscriptionInfo(subscriptionData ?? null),
    [subscriptionData],
  );

  return {
    subscriptionInfo,
    subscriptionStatus: subscriptionData ?? null,
    isLoading,
    error,
  };
};
