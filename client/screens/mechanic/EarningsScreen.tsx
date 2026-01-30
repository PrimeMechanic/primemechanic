import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Button } from "@/components/Button";
import { useTheme } from "@/context/ThemeContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { earningsData, completedJobs } from "@/data/mechanicData";

interface EarningsCardProps {
  title: string;
  amount: number;
  subtitle: string;
  icon: string;
  gradient?: string[];
  iconColor?: string;
}

function EarningsCard({ title, amount, subtitle, icon, gradient, iconColor }: EarningsCardProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.earningsCard, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
      {gradient ? (
        <LinearGradient
          colors={gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.earningsIconContainer}
        >
          <Feather name={icon as any} size={20} color="#FFFFFF" />
        </LinearGradient>
      ) : (
        <View style={[styles.earningsIconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Feather name={icon as any} size={20} color={iconColor} />
        </View>
      )}
      <View style={styles.earningsContent}>
        <ThemedText style={[styles.earningsTitle, { color: colors.textSecondary }]}>{title}</ThemedText>
        <ThemedText style={[styles.earningsAmount, { color: colors.text }]}>${amount}</ThemedText>
      </View>
      <ThemedText style={[styles.earningsSubtitle, { color: colors.textSecondary }]}>{subtitle}</ThemedText>
    </View>
  );
}

export default function EarningsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [selectedPeriod, setSelectedPeriod] = useState(1);

  const weeklyData = [
    { day: "Mon", amount: 150, height: 60 },
    { day: "Tue", amount: 225, height: 90 },
    { day: "Wed", amount: 175, height: 70 },
    { day: "Thu", amount: 200, height: 80 },
    { day: "Fri", amount: 125, height: 50 },
    { day: "Sat", amount: 0, height: 0 },
    { day: "Sun", amount: 0, height: 0 },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const currentEarnings = selectedPeriod === 0 
    ? earningsData.today 
    : selectedPeriod === 1 
      ? earningsData.thisWeek 
      : earningsData.thisMonth;

  const jobCount = selectedPeriod === 0 ? "2" : selectedPeriod === 1 ? "8" : "32";
  const periodLabel = selectedPeriod === 0 ? "day" : selectedPeriod === 1 ? "week" : "month";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.safeAreaTopOffset,
        paddingBottom: tabBarHeight + Spacing["3xl"],
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <ThemedText style={[styles.screenTitle, { color: colors.text }]}>Earnings</ThemedText>
      </View>

      <View style={styles.periodSelector}>
        <View style={[styles.segmentContainer, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
          <SegmentedControl
            segments={["Today", "Week", "Month"]}
            selectedIndex={selectedPeriod}
            onIndexChange={setSelectedPeriod}
          />
        </View>
      </View>

      <View style={styles.summarySection}>
        <LinearGradient
          colors={["#0FA958", "#0B8A47"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.totalCard}
        >
          <ThemedText style={styles.totalLabel}>
            {selectedPeriod === 0 ? "Today's" : selectedPeriod === 1 ? "This Week's" : "This Month's"} Earnings
          </ThemedText>
          <ThemedText style={styles.totalAmount}>
            ${currentEarnings.toLocaleString()}
          </ThemedText>
          <View style={styles.totalStats}>
            <View style={styles.totalStatItem}>
              <View style={styles.statIconCircle}>
                <Feather name="briefcase" size={14} color="#0FA958" />
              </View>
              <ThemedText style={styles.totalStatText}>{jobCount} jobs</ThemedText>
            </View>
            <View style={styles.totalStatItem}>
              <View style={[styles.statIconCircle, { backgroundColor: "rgba(34, 197, 94, 0.15)" }]}>
                <Feather name="trending-up" size={14} color="#22C55E" />
              </View>
              <ThemedText style={[styles.totalStatText, { color: "#22C55E" }]}>
                +12% vs last {periodLabel}
              </ThemedText>
            </View>
          </View>
        </LinearGradient>
      </View>

      {selectedPeriod === 1 ? (
        <View style={styles.chartSection}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Weekly Overview</ThemedText>
          <View style={[styles.chartContainer, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
            {weeklyData.map((item) => (
              <View key={item.day} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  {item.amount > 0 ? (
                    <LinearGradient
                      colors={["#0FA958", "#0B8A47"]}
                      start={{ x: 0, y: 1 }}
                      end={{ x: 0, y: 0 }}
                      style={[styles.bar, { height: item.height || 4 }]}
                    />
                  ) : (
                    <View style={[styles.bar, { height: 4, backgroundColor: colors.border }]} />
                  )}
                </View>
                <ThemedText style={[styles.barLabel, { color: colors.textSecondary }]}>{item.day}</ThemedText>
                {item.amount > 0 ? (
                  <ThemedText style={[styles.barAmount, { color: colors.primary }]}>${item.amount}</ThemedText>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.cardsSection}>
        <EarningsCard
          title="Available Balance"
          amount={earningsData.thisWeek - earningsData.pending}
          subtitle="Ready to withdraw"
          icon="credit-card"
          gradient={["#22C55E", "#16A34A"]}
        />
        <EarningsCard
          title="Pending"
          amount={earningsData.pending}
          subtitle="Processing (1-2 days)"
          icon="clock"
          iconColor="#F59E0B"
        />
      </View>

      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</ThemedText>
          <Pressable hitSlop={12}>
            <ThemedText style={[styles.seeAllText, { color: colors.primary }]}>See All</ThemedText>
          </Pressable>
        </View>
        <View style={[styles.transactionsList, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
          {completedJobs.slice(0, 5).map((job, index) => (
            <View 
              key={job.id} 
              style={[
                styles.transactionItem, 
                index < completedJobs.slice(0, 5).length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
              ]}
            >
              <View style={styles.transactionLeft}>
                <LinearGradient
                  colors={["#0FA958", "#0B8A47"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.transactionIconContainer}
                >
                  <Feather name={job.service.icon as any} size={16} color="#FFFFFF" />
                </LinearGradient>
                <View>
                  <ThemedText style={[styles.transactionService, { color: colors.text }]}>
                    {job.service.name}
                  </ThemedText>
                  <ThemedText style={[styles.transactionCustomer, { color: colors.textSecondary }]}>
                    {job.customer.name}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <ThemedText style={[styles.transactionAmount, { color: colors.success }]}>
                  +${job.totalPrice}
                </ThemedText>
                <ThemedText style={[styles.transactionDate, { color: colors.textSecondary }]}>
                  {formatDate(job.date)}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.withdrawSection}>
        <Button size="large" onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
          Withdraw Funds
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
  },
  periodSelector: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  segmentContainer: {
    borderRadius: 14,
    padding: 4,
  },
  summarySection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  totalCard: {
    borderRadius: BorderRadius.xl,
    paddingTop: Spacing["2xl"],
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    lineHeight: 14 * 1.15,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: Spacing.sm,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    lineHeight: 36 * 1.15,
    color: "#FFFFFF",
    marginBottom: Spacing.lg,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  totalStats: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  totalStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  totalStatText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
  },
  chartSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
    marginBottom: Spacing.md,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
  },
  barContainer: {
    height: 100,
    justifyContent: "flex-end",
    marginBottom: Spacing.sm,
  },
  bar: {
    width: 24,
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 12,
  },
  barAmount: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  cardsSection: {
    flexDirection: "column",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  earningsCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    minHeight: 88,
  },
  earningsIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  earningsContent: {
    flex: 1,
    justifyContent: "center",
  },
  earningsTitle: {
    fontSize: 13,
    lineHeight: 13 * 1.15,
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    lineHeight: 22 * 1.15,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  earningsSubtitle: {
    fontSize: 12,
    lineHeight: 12 * 1.15,
  },
  transactionsSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  transactionsList: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  transactionService: {
    fontSize: 15,
    fontWeight: "500",
  },
  transactionCustomer: {
    fontSize: 13,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  withdrawSection: {
    paddingHorizontal: Spacing.xl,
  },
});
