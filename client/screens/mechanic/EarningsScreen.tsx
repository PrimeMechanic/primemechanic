import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable, Image } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { SegmentedControl } from "@/components/SegmentedControl";
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
  return (
    <View style={styles.earningsCard}>
      <View style={[styles.earningsIconContainer, { backgroundColor: `${color}15` }]}>
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.earningsContent}>
        <ThemedText style={styles.earningsTitle}>{title}</ThemedText>
        <ThemedText style={styles.earningsAmount}>${amount}</ThemedText>
      </View>
      <ThemedText style={styles.earningsSubtitle}>{subtitle}</ThemedText>
    </View>
  );
}

export default function EarningsScreen() {
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
      style={styles.container}
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
        <View style={styles.totalCard}>
          <ThemedText style={styles.totalLabel}>
            {selectedPeriod === 0 ? "Today's" : selectedPeriod === 1 ? "This Week's" : "This Month's"} Earnings
          </ThemedText>
          <ThemedText 
            style={styles.totalAmount}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            ${selectedPeriod === 0 ? earningsData.today : selectedPeriod === 1 ? earningsData.thisWeek : earningsData.thisMonth}
          </ThemedText>
          <View style={styles.totalStats}>
            <View style={styles.totalStatItem}>
              <Feather name="briefcase" size={16} color={Colors.dark.accent} />
              <ThemedText style={styles.totalStatText}>
                {selectedPeriod === 0 ? "2" : selectedPeriod === 1 ? "8" : "32"} jobs
              </ThemedText>
            </View>
            <View style={styles.totalStatItem}>
              <Feather name="trending-up" size={16} color={Colors.dark.success} />
              <ThemedText style={[styles.totalStatText, { color: Colors.dark.success }]}>
                +12% vs last {selectedPeriod === 0 ? "day" : selectedPeriod === 1 ? "week" : "month"}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {selectedPeriod === 1 ? (
        <View style={styles.chartSection}>
          <ThemedText style={styles.chartTitle}>Weekly Overview</ThemedText>
          <View style={styles.chartContainer}>
            {weeklyData.map((item, index) => (
              <View key={item.day} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: item.height || 4,
                        backgroundColor: item.amount > 0 ? Colors.dark.accent : Colors.dark.border,
                      },
                    ]}
                  />
                </View>
                <ThemedText style={styles.barLabel}>{item.day}</ThemedText>
                {item.amount > 0 ? (
                  <ThemedText style={styles.barAmount}>${item.amount}</ThemedText>
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
          icon="wallet"
          color={Colors.dark.success}
        />
        <EarningsCard
          title="Pending"
          amount={earningsData.pending}
          subtitle="Processing (1-2 days)"
          icon="clock"
          color={Colors.dark.warning}
        />
      </View>

      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Recent Transactions</ThemedText>
          <Pressable>
            <ThemedText style={styles.seeAllText}>See All</ThemedText>
          </Pressable>
        </View>
        <View style={styles.transactionsList}>
          {completedJobs.slice(0, 5).map((job) => (
            <View key={job.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={styles.transactionIconContainer}>
                  <Feather name={job.service.icon as any} size={18} color={Colors.dark.accent} />
                </View>
                <View>
                  <ThemedText style={styles.transactionService}>
                    {job.service.name}
                  </ThemedText>
                  <ThemedText style={styles.transactionCustomer}>
                    {job.customer.name}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <ThemedText style={styles.transactionAmount}>
                  +${job.totalPrice}
                </ThemedText>
                <ThemedText style={styles.transactionDate}>
                  {formatDate(job.date)}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>

      <Pressable style={styles.withdrawButton}>
        <Feather name="credit-card" size={20} color={Colors.dark.buttonText} />
        <ThemedText style={styles.withdrawText}>Withdraw Funds</ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundDefault,
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
    backgroundColor: Colors.dark.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: Spacing.sm,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    color: Colors.dark.buttonText,
    marginBottom: Spacing.md,
    textAlign: "center",
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
    color: "rgba(255, 255, 255, 0.8)",
  },
  chartSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.dark.backgroundRoot,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
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
    color: Colors.dark.textSecondary,
  },
  barAmount: {
    fontSize: 10,
    color: Colors.dark.accent,
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
    backgroundColor: Colors.dark.backgroundRoot,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
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
    color: Colors.dark.textSecondary,
  },
  earningsAmount: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    color: Colors.dark.text,
  },
  earningsSubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
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
    color: Colors.dark.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.dark.accent,
    fontWeight: "500",
  },
  transactionsList: {
    backgroundColor: Colors.dark.backgroundRoot,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: "hidden",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  transactionService: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.dark.text,
  },
  transactionCustomer: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.success,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  withdrawButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.primary,
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  withdrawText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.buttonText,
  },
});
