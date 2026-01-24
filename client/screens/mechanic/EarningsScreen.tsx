import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable, Image } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useTheme } from "@/context/ThemeContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { earningsData, completedJobs } from "@/data/mechanicData";

interface EarningsCardProps {
  title: string;
  amount: number;
  subtitle: string;
  icon: string;
  color: string;
}

function EarningsCard({ title, amount, subtitle, icon, color }: EarningsCardProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.earningsCard, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
      <View style={[styles.earningsIconContainer, { backgroundColor: `${color}15` }]}>
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.earningsContent}>
        <ThemedText style={[styles.earningsTitle, { color: colors.textSecondary }]}>{title}</ThemedText>
        <ThemedText style={[styles.earningsAmount, { color: colors.text }]}>${amount}</ThemedText>
      </View>
      <ThemedText style={[styles.earningsSubtitle, { color: colors.textSecondary }]}>{subtitle}</ThemedText>
    </View>
  );
}

export default function EarningsScreen() {
  const { colors, isDark } = useTheme();
  const headerHeight = useHeaderHeight();
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing["3xl"],
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.periodSelector}>
        <SegmentedControl
          segments={["Today", "Week", "Month"]}
          selectedIndex={selectedPeriod}
          onIndexChange={setSelectedPeriod}
        />
      </View>

      <View style={styles.summarySection}>
        <View style={[styles.totalCard, { backgroundColor: isDark ? colors.backgroundSecondary : colors.primary }]}>
          <ThemedText style={[styles.totalLabel, { color: isDark ? colors.textSecondary : "rgba(255, 255, 255, 0.7)" }]}>
            {selectedPeriod === 0 ? "Today's" : selectedPeriod === 1 ? "This Week's" : "This Month's"} Earnings
          </ThemedText>
          <ThemedText style={[styles.totalAmount, { color: isDark ? colors.accent : colors.buttonText }]}>
            ${selectedPeriod === 0 ? earningsData.today.toLocaleString() : selectedPeriod === 1 ? earningsData.thisWeek.toLocaleString() : earningsData.thisMonth.toLocaleString()}
          </ThemedText>
          <View style={styles.totalStats}>
            <View style={styles.totalStatItem}>
              <Feather name="briefcase" size={16} color={colors.accent} />
              <ThemedText style={[styles.totalStatText, { color: isDark ? colors.textSecondary : "rgba(255, 255, 255, 0.8)" }]}>
                {selectedPeriod === 0 ? "2" : selectedPeriod === 1 ? "8" : "32"} jobs
              </ThemedText>
            </View>
            <View style={styles.totalStatItem}>
              <Feather name="trending-up" size={16} color={colors.success} />
              <ThemedText style={[styles.totalStatText, { color: colors.success }]}>
                +12% vs last {selectedPeriod === 0 ? "day" : selectedPeriod === 1 ? "week" : "month"}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {selectedPeriod === 1 ? (
        <View style={styles.chartSection}>
          <ThemedText style={[styles.chartTitle, { color: colors.text }]}>Weekly Overview</ThemedText>
          <View style={[styles.chartContainer, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
            {weeklyData.map((item, index) => (
              <View key={item.day} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: item.height || 4,
                        backgroundColor: item.amount > 0 ? colors.accent : colors.border,
                      },
                    ]}
                  />
                </View>
                <ThemedText style={[styles.barLabel, { color: colors.textSecondary }]}>{item.day}</ThemedText>
                {item.amount > 0 ? (
                  <ThemedText style={[styles.barAmount, { color: colors.accent }]}>${item.amount}</ThemedText>
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
          color={colors.success}
        />
        <EarningsCard
          title="Pending"
          amount={earningsData.pending}
          subtitle="Processing (1-2 days)"
          icon="clock"
          color={colors.warning}
        />
      </View>

      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</ThemedText>
          <Pressable>
            <ThemedText style={[styles.seeAllText, { color: colors.accent }]}>See All</ThemedText>
          </Pressable>
        </View>
        <View style={[styles.transactionsList, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
          {completedJobs.slice(0, 5).map((job) => (
            <View key={job.id} style={[styles.transactionItem, { borderBottomColor: colors.border }]}>
              <View style={styles.transactionLeft}>
                <View style={[styles.transactionIconContainer, { backgroundColor: `${colors.accent}26` }]}>
                  <Feather name={job.service.icon as any} size={18} color={colors.accent} />
                </View>
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

      <Pressable style={[styles.withdrawButton, { backgroundColor: colors.primary }]}>
        <Feather name="credit-card" size={20} color={colors.buttonText} />
        <ThemedText style={[styles.withdrawText, { color: colors.buttonText }]}>Withdraw Funds</ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  periodSelector: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  summarySection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  totalCard: {
    borderRadius: BorderRadius.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  totalAmount: {
    fontSize: 28,
    lineHeight: 40,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    marginBottom: Spacing.sm,
  },
  totalStats: {
    flexDirection: "row",
    gap: Spacing.xl,
  },
  totalStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  totalStatText: {
    fontSize: 14,
  },
  chartSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
    marginBottom: Spacing.md,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
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
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 12,
  },
  barAmount: {
    fontSize: 10,
    marginTop: 2,
  },
  cardsSection: {
    flexDirection: "column",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  earningsCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  earningsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  earningsContent: {
    flex: 1,
  },
  earningsTitle: {
    fontSize: 13,
  },
  earningsAmount: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
  },
  earningsSubtitle: {
    fontSize: 12,
  },
  transactionsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  transactionsList: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontWeight: "600",
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  withdrawButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  withdrawText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
