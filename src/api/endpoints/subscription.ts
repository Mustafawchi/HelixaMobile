import { loggedCallable } from "../../utils/networkLogger";
import { functions } from "../../config/firebase";
import type { SubscriptionStatus } from "../../types/subscription";

export const subscriptionApi = {
  getStatus: async (): Promise<SubscriptionStatus> => {
    const getSubscriptionStatus = loggedCallable<void, SubscriptionStatus>(
      functions,
      "getSubscriptionStatus",
    );

    const result = await getSubscriptionStatus();
    return result.data;
  },
};
