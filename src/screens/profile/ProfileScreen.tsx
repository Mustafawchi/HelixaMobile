import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, spacing, typography, borderRadius } from "../../theme";
import SubscriptionPlanCard from "./components/SubscriptionPlanCard";
import InsightsCard from "./components/InsightsCard";
import RecentActivityCard from "./components/RecentActivityCard";
import { useUser } from "../../hooks/queries/useUser";
import { usePaginatedPatients } from "../../hooks/queries/usePatients";
import { useSubscriptionInfo } from "../../hooks/queries/useSubscription";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: profile, isLoading } = useUser(true);
  const { data: paginatedData, isLoading: patientsLoading } = usePaginatedPatients();
  const firstPage = paginatedData?.pages?.[0];
  const patients = firstPage?.patients ?? [];
  const totalMattersCount = firstPage?.totalCount ?? 0;
  const totalNotesCount = firstPage?.totalNotes ?? 0;
  const { subscriptionInfo, subscriptionStatus, isLoading: subscriptionLoading } =
    useSubscriptionInfo(true);

  const fullName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    : "";
  const initials = profile
    ? `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase()
    : "";
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";
  const roleLabel =
    profile?.role || profile?.positionInPractice || profile?.practiceName || "";
  const totalNotes = totalNotesCount;
  const totalMatters = totalMattersCount;
  const notesUsed = subscriptionStatus?.notesUsed ?? 0;
  const noteLimit = subscriptionStatus?.noteLimit ?? 12;
  const usagePercentage =
    noteLimit && noteLimit > 0 ? Math.min(100, (notesUsed / noteLimit) * 100) : 0;
  const billingCycleText =
    subscriptionStatus?.billingCycle === "weekly" ? "week" : "month";
  const notesRemaining =
    noteLimit === null ? null : Math.max(0, noteLimit - notesUsed);

  const mostActivePatient = [...patients]
    .sort((a, b) => (b.noteCount || 0) - (a.noteCount || 0))
    .find((p) => (p.noteCount || 0) > 0);

  const recentPatient = [...patients].sort(
    (a, b) =>
      new Date(b.lastModified || 0).getTime() - new Date(a.lastModified || 0).getTime(),
  )[0];

  const averageNotesPerMatter =
    totalMatters > 0 ? Math.round((totalNotes / totalMatters) * 10) / 10 : 0;

  const getPlanDescription = () => {
    if (!subscriptionStatus) return "12 notes per month • PDF export only • Basic features";

    const plan = subscriptionStatus.plan;
    const cycle = subscriptionStatus.billingCycle;

    switch (plan) {
      case "Premium":
        return cycle === "weekly"
          ? "30 notes per week • PDF + Word export • Priority support"
          : "120 notes per month • PDF + Word export • Priority support";
      case "Gold":
        return cycle === "weekly"
          ? "100 notes per week • PDF + Word export • Premium features"
          : "400 notes per month • PDF + Word export • Premium features";
      case "Free":
      default:
        return "12 notes per month • PDF export only • Basic features";
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: 0, paddingHorizontal: 0 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.headerCard,
          { paddingTop: insets.top + spacing.lg },
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {isLoading ? "..." : initials || "?"}
          </Text>
        </View>
        <Text style={styles.name}>{isLoading ? "Loading..." : fullName}</Text>
        <Text style={styles.email}>
          {isLoading ? " " : profile?.email || ""}
        </Text>
        {!!roleLabel && <Text style={styles.role}>{roleLabel}</Text>}
        {!!memberSince && (
          <Text style={styles.member}>Member since {memberSince}</Text>
        )}
      </View>

      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="pulse" size={16} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Usage Overview</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {patientsLoading || subscriptionLoading ? "..." : totalNotes}
              </Text>
              <Text style={styles.statLabel}>Total Notes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {patientsLoading ? "..." : totalMatters}
              </Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {subscriptionLoading ? "..." : `${Math.round(usagePercentage)}%`}
              </Text>
              <Text style={styles.statLabel}>Plan Used</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.usageRow}>
            <Text style={styles.usageTitle}>
              Notes Used This {billingCycleText === "week" ? "Week" : "Month"}
            </Text>
            <Text style={styles.usageCount}>
              {subscriptionLoading ? "..." : `${notesUsed} / ${noteLimit ?? "∞"}`}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${usagePercentage}%` }]} />
          </View>
          <Text style={styles.usageHint}>
            {subscriptionLoading
              ? "Loading usage..."
              : notesRemaining === null
                ? "Unlimited notes remaining"
                : `${notesRemaining} notes remaining this ${billingCycleText}`}
          </Text>
          <Text style={styles.usageSub}>
            Usage resets next {billingCycleText === "week" ? "week" : "month"}
          </Text>
        </View>
      </View>

      <View style={styles.cardWrapper}>
        <SubscriptionPlanCard
          planName={
            subscriptionLoading
              ? "Loading plan..."
              : `${subscriptionInfo.plan} Plan`
          }
          planTag={
            subscriptionLoading
              ? "Plan"
              : subscriptionStatus?.isActive
                ? "Active Subscription"
                : `${subscriptionInfo.plan} Plan`
          }
          details={getPlanDescription()}
          onUpgrade={() => {}}
        />
      </View>

      <View style={styles.cardWrapper}>
        <InsightsCard
          items={[
            {
              icon: "stats-chart",
              color: COLORS.primary,
              text: subscriptionLoading
                ? "Loading subscription insights..."
                : `You're using ${notesUsed} of ${noteLimit ?? "∞"} notes on your ${subscriptionInfo.plan} plan (${billingCycleText})`,
            },
            {
              icon: "trending-up",
              color: COLORS.warning,
              text: mostActivePatient
                ? `You've been most active with ${mostActivePatient.name || "this patient"}`
                : "Start creating notes to unlock activity insights",
            },
            {
              icon: "time",
              color: COLORS.info,
              text:
                totalMatters > 0
                  ? `You've created an average of ${averageNotesPerMatter} notes per matter`
                  : "No matters yet. Add your first patient to get started.",
            },
          ]}
        />
      </View>

      <View style={styles.cardWrapper}>
        <RecentActivityCard
          name={recentPatient?.name || "No recent activity"}
          subtitle={
            recentPatient
              ? `${new Date(recentPatient.lastModified).toLocaleDateString()} • ${recentPatient.noteCount || 0} notes`
              : "Your recent patient activity will appear here"
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  cardWrapper: {
    paddingHorizontal: spacing.lg,
  },
  headerCard: {
    backgroundColor: COLORS.primary,
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    marginTop: Platform.OS === "ios" ? spacing.sm : 0,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.white,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },
  email: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 4,
  },
  role: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 4,
  },
  member: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 8,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: spacing.md,
  },
  usageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  usageTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  usageCount: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "700",
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.borderLight,
    marginTop: spacing.sm,
  },
  progressFill: {
    width: "8%",
    height: "100%",
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  usageHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: spacing.sm,
  },
  usageSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
