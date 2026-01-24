import React from "react";
import { StyleSheet, View, ScrollView, Pressable, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
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
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: bgColor }]}>
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
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
  return (
    <Pressable
      style={({ pressed }) => [
        styles.scheduleItem,
        pressed && styles.scheduleItemPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.scheduleTime}>
        <ThemedText style={styles.timeText}>{time}</ThemedText>
        {status === "in_progress" ? (
          <View style={styles.activeBadge}>
            <ThemedText style={styles.activeBadgeText}>Active</ThemedText>
          </View>
        ) : null}
      </View>
      <View style={styles.scheduleContent}>
        <ThemedText style={styles.customerName}>{customer}</ThemedText>
        <ThemedText style={styles.serviceText}>{service}</ThemedText>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={12} color={Colors.dark.textSecondary} />
          <ThemedText style={styles.locationText} numberOfLines={1}>
            {location}
          </ThemedText>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={Colors.dark.textSecondary} />
    </Pressable>
  );
}

export default function MechanicDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const pendingRequests = jobRequests.filter((j) => j.status === "pending").length;

  const handleSchedulePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeRow}>
          <View>
            <ThemedText style={styles.greeting}>Good morning,</ThemedText>
            <ThemedText style={styles.name}>{mechanicProfile.name}</ThemedText>
          </View>
          <Image source={mechanicProfile.avatar} style={styles.avatar} />
        </View>
        {pendingRequests > 0 ? (
          <View style={styles.alertBanner}>
            <Feather name="bell" size={18} color={Colors.dark.accent} />
            <ThemedText style={styles.alertText}>
              You have {pendingRequests} new job request{pendingRequests > 1 ? "s" : ""}
            </ThemedText>
            <Feather name="chevron-right" size={18} color={Colors.dark.accent} />
          </View>
        ) : null}
      </View>

      <View style={styles.statsSection}>
        <StatCard
          icon="dollar-sign"
          label="Today"
          value={`$${earningsData.today}`}
          color={Colors.dark.success}
          bgColor="rgba(34, 197, 94, 0.1)"
        />
        <StatCard
          icon="trending-up"
          label="This Week"
          value={`$${earningsData.thisWeek}`}
          color={Colors.dark.accent}
          bgColor="rgba(0, 212, 255, 0.1)"
        />
        <StatCard
          icon="star"
          label="Rating"
          value={mechanicProfile.rating.toString()}
          color={Colors.dark.warning}
          bgColor="rgba(245, 158, 11, 0.1)"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Today's Schedule</ThemedText>
          <ThemedText style={styles.sectionCount}>
            {todaysSchedule.length} jobs
          </ThemedText>
        </View>
        {todaysSchedule.length > 0 ? (
          <View style={styles.scheduleList}>
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
          <View style={styles.emptySchedule}>
            <Feather name="calendar" size={40} color={Colors.dark.textSecondary} />
            <ThemedText style={styles.emptyText}>No jobs scheduled today</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Quick Stats</ThemedText>
        <View style={styles.quickStatsGrid}>
          <View style={styles.quickStatItem}>
            <ThemedText style={styles.quickStatValue}>
              {mechanicProfile.completedJobs}
            </ThemedText>
            <ThemedText style={styles.quickStatLabel}>Total Jobs</ThemedText>
          </View>
          <View style={styles.quickStatItem}>
            <ThemedText style={styles.quickStatValue}>
              {mechanicProfile.reviewCount}
            </ThemedText>
            <ThemedText style={styles.quickStatLabel}>Reviews</ThemedText>
          </View>
          <View style={styles.quickStatItem}>
            <ThemedText style={styles.quickStatValue}>
              ${earningsData.thisMonth}
            </ThemedText>
            <ThemedText style={styles.quickStatLabel}>This Month</ThemedText>
          </View>
          <View style={styles.quickStatItem}>
            <ThemedText style={styles.quickStatValue}>
              ${earningsData.pending}
            </ThemedText>
            <ThemedText style={styles.quickStatLabel}>Pending</ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundDefault,
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
    color: Colors.dark.textSecondary,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    color: Colors.dark.text,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.dark.accent,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark.accent,
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
    backgroundColor: Colors.dark.backgroundRoot,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
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
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
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
    color: Colors.dark.text,
  },
  sectionCount: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  scheduleList: {
    backgroundColor: Colors.dark.backgroundRoot,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: "hidden",
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  scheduleItemPressed: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  scheduleTime: {
    width: 80,
    marginRight: Spacing.md,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  activeBadge: {
    backgroundColor: Colors.dark.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.dark.buttonText,
  },
  scheduleContent: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 2,
  },
  serviceText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    flex: 1,
  },
  emptySchedule: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    backgroundColor: Colors.dark.backgroundRoot,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.md,
  },
  quickStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  quickStatItem: {
    width: "47%",
    backgroundColor: Colors.dark.backgroundRoot,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    color: Colors.dark.text,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
});
