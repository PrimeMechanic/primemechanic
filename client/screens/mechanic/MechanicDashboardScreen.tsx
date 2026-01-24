import React from "react";
import { StyleSheet, View, ScrollView, Pressable, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/context/ThemeContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import {
  mechanicProfile,
  earningsData,
  todaysSchedule,
  jobRequests,
} from "@/data/mechanicData";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

function StatCard({ icon, label, value, color, bgColor }: StatCardProps) {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.statCard, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
      <View style={[styles.statIconContainer, { backgroundColor: bgColor }]}>
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <ThemedText style={[styles.statValue, { color: colors.text }]}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

interface ScheduleItemProps {
  time: string;
  customer: string;
  service: string;
  location: string;
  status: "upcoming" | "in_progress";
  onPress: () => void;
}

function ScheduleItem({
  time,
  customer,
  service,
  location,
  status,
  onPress,
}: ScheduleItemProps) {
  const { colors } = useTheme();
  
  return (
    <Pressable
      style={({ pressed }) => [
        styles.scheduleItem,
        { borderBottomColor: colors.border },
        pressed && { backgroundColor: colors.backgroundSecondary },
      ]}
      onPress={onPress}
    >
      <View style={styles.scheduleTime}>
        <ThemedText style={[styles.timeText, { color: colors.text }]}>{time}</ThemedText>
        {status === "in_progress" ? (
          <View style={[styles.activeBadge, { backgroundColor: colors.success }]}>
            <ThemedText style={[styles.activeBadgeText, { color: colors.buttonText }]}>Active</ThemedText>
          </View>
        ) : null}
      </View>
      <View style={styles.scheduleContent}>
        <ThemedText style={[styles.customerName, { color: colors.text }]}>{customer}</ThemedText>
        <ThemedText style={[styles.serviceText, { color: colors.textSecondary }]}>{service}</ThemedText>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={12} color={colors.textSecondary} />
          <ThemedText style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
            {location}
          </ThemedText>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

export default function MechanicDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const pendingRequests = jobRequests.filter((j) => j.status === "pending").length;

  const handleSchedulePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundDefault }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing["3xl"],
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeRow}>
          <View>
            <ThemedText style={[styles.greeting, { color: colors.textSecondary }]}>Good morning,</ThemedText>
            <ThemedText style={[styles.name, { color: colors.text }]}>{mechanicProfile.name}</ThemedText>
          </View>
          <Image source={mechanicProfile.avatar} style={[styles.avatar, { borderColor: colors.accent }]} />
        </View>
        {pendingRequests > 0 ? (
          <View style={[styles.alertBanner, { backgroundColor: `rgba(0, 212, 255, 0.1)` }]}>
            <Feather name="bell" size={18} color={colors.accent} />
            <ThemedText style={[styles.alertText, { color: colors.accent }]}>
              You have {pendingRequests} new job request{pendingRequests > 1 ? "s" : ""}
            </ThemedText>
            <Feather name="chevron-right" size={18} color={colors.accent} />
          </View>
        ) : null}
      </View>

      <View style={styles.statsSection}>
        <StatCard
          icon="dollar-sign"
          label="Today"
          value={`$${earningsData.today}`}
          color={colors.success}
          bgColor="rgba(34, 197, 94, 0.1)"
        />
        <StatCard
          icon="trending-up"
          label="This Week"
          value={`$${earningsData.thisWeek}`}
          color={colors.accent}
          bgColor="rgba(0, 212, 255, 0.1)"
        />
        <StatCard
          icon="star"
          label="Rating"
          value={mechanicProfile.rating.toString()}
          color={colors.warning}
          bgColor="rgba(245, 158, 11, 0.1)"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Today's Schedule</ThemedText>
          <ThemedText style={[styles.sectionCount, { color: colors.textSecondary }]}>
            {todaysSchedule.length} jobs
          </ThemedText>
        </View>
        {todaysSchedule.length > 0 ? (
          <View style={[styles.scheduleList, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
            {todaysSchedule.map((item) => (
              <ScheduleItem
                key={item.id}
                time={item.time}
                customer={item.customer}
                service={item.service}
                location={item.location}
                status={item.status}
                onPress={handleSchedulePress}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.emptySchedule, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
            <Feather name="calendar" size={40} color={colors.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>No jobs scheduled today</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Quick Stats</ThemedText>
        <View style={styles.quickStatsGrid}>
          <View style={[styles.quickStatItem, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
            <ThemedText style={[styles.quickStatValue, { color: colors.text }]}>
              {mechanicProfile.completedJobs}
            </ThemedText>
            <ThemedText style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Total Jobs</ThemedText>
          </View>
          <View style={[styles.quickStatItem, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
            <ThemedText style={[styles.quickStatValue, { color: colors.text }]}>
              {mechanicProfile.reviewCount}
            </ThemedText>
            <ThemedText style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Reviews</ThemedText>
          </View>
          <View style={[styles.quickStatItem, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
            <ThemedText style={[styles.quickStatValue, { color: colors.text }]}>
              ${earningsData.thisMonth}
            </ThemedText>
            <ThemedText style={[styles.quickStatLabel, { color: colors.textSecondary }]}>This Month</ThemedText>
          </View>
          <View style={[styles.quickStatItem, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
            <ThemedText style={[styles.quickStatValue, { color: colors.text }]}>
              ${earningsData.pending}
            </ThemedText>
            <ThemedText style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Pending</ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  welcomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  greeting: {
    fontSize: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  statsSection: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
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
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
  },
  sectionCount: {
    fontSize: 14,
  },
  scheduleList: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  scheduleTime: {
    width: 80,
    marginRight: Spacing.md,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  scheduleContent: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  serviceText: {
    fontSize: 14,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    flex: 1,
  },
  emptySchedule: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 15,
    marginTop: Spacing.md,
  },
  quickStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  quickStatItem: {
    width: "47%",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 13,
  },
});
