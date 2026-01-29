import React from "react";
import { StyleSheet, View, ScrollView, Pressable, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/context/ThemeContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
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
  gradient?: string[];
  iconColor?: string;
}

function StatCard({ icon, label, value, gradient, iconColor }: StatCardProps) {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.statCard, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
      {gradient ? (
        <LinearGradient
          colors={gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statIconContainer}
        >
          <Feather name={icon as any} size={18} color="#FFFFFF" />
        </LinearGradient>
      ) : (
        <View style={[styles.statIconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Feather name={icon as any} size={18} color={iconColor} />
        </View>
      )}
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
  isLast: boolean;
}

function ScheduleItem({
  time,
  customer,
  service,
  location,
  status,
  onPress,
  isLast,
}: ScheduleItemProps) {
  const { colors } = useTheme();
  
  return (
    <Pressable
      style={({ pressed }) => [
        styles.scheduleItem,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
        pressed && { backgroundColor: `${colors.primary}05` },
      ]}
      onPress={onPress}
    >
      <View style={styles.scheduleTime}>
        <ThemedText style={[styles.timeText, { color: colors.text }]}>{time}</ThemedText>
        {status === "in_progress" ? (
          <LinearGradient
            colors={["#0FA958", "#0B8A47"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.activeBadge}
          >
            <ThemedText style={styles.activeBadgeText}>Active</ThemedText>
          </LinearGradient>
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
      <View style={[styles.chevronContainer, { backgroundColor: `${colors.primary}10` }]}>
        <Feather name="chevron-right" size={16} color={colors.primary} />
      </View>
    </Pressable>
  );
}

export default function MechanicDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const pendingRequests = jobRequests.filter((j) => j.status === "pending").length;

  const handleSchedulePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing["2xl"],
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
          <Image source={mechanicProfile.avatar} style={[styles.avatar, { borderColor: colors.primary }]} />
        </View>
        {pendingRequests > 0 ? (
          <Pressable style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
            <LinearGradient
              colors={["#0FA95815", "#0B8A4710"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.alertBanner, { borderColor: `${colors.primary}30` }]}
            >
              <View style={[styles.alertIconContainer, { backgroundColor: `${colors.primary}20` }]}>
                <Feather name="bell" size={16} color={colors.primary} />
              </View>
              <ThemedText style={[styles.alertText, { color: colors.text }]}>
                You have <ThemedText style={{ fontWeight: "700", color: colors.primary }}>{pendingRequests}</ThemedText> new job request{pendingRequests > 1 ? "s" : ""}
              </ThemedText>
              <Feather name="chevron-right" size={18} color={colors.primary} />
            </LinearGradient>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.statsSection}>
        <StatCard
          icon="dollar-sign"
          label="Today"
          value={`$${earningsData.today}`}
          gradient={["#22C55E", "#16A34A"]}
        />
        <StatCard
          icon="trending-up"
          label="This Week"
          value={`$${earningsData.thisWeek}`}
          gradient={["#0FA958", "#0B8A47"]}
        />
        <StatCard
          icon="star"
          label="Rating"
          value={mechanicProfile.rating.toString()}
          iconColor="#F59E0B"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Today's Schedule</ThemedText>
          <View style={[styles.countBadge, { backgroundColor: `${colors.primary}15` }]}>
            <ThemedText style={[styles.countText, { color: colors.primary }]}>
              {todaysSchedule.length} jobs
            </ThemedText>
          </View>
        </View>
        {todaysSchedule.length > 0 ? (
          <View style={[styles.scheduleList, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
            {todaysSchedule.map((item, index) => (
              <ScheduleItem
                key={item.id}
                time={item.time}
                customer={item.customer}
                service={item.service}
                location={item.location}
                status={item.status}
                onPress={handleSchedulePress}
                isLast={index === todaysSchedule.length - 1}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.emptySchedule, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
            <View style={[styles.emptyIconContainer, { backgroundColor: `${colors.textSecondary}10` }]}>
              <Feather name="calendar" size={32} color={colors.textSecondary} />
            </View>
            <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>No jobs scheduled</ThemedText>
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              Your scheduled jobs will appear here
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Quick Stats</ThemedText>
        <View style={styles.quickStatsGrid}>
          <View style={[styles.quickStatItem, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
            <View style={[styles.quickStatIcon, { backgroundColor: `${colors.primary}15` }]}>
              <Feather name="check-circle" size={18} color={colors.primary} />
            </View>
            <ThemedText style={[styles.quickStatValue, { color: colors.text }]}>
              {mechanicProfile.completedJobs}
            </ThemedText>
            <ThemedText style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Total Jobs</ThemedText>
          </View>
          <View style={[styles.quickStatItem, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
            <View style={[styles.quickStatIcon, { backgroundColor: "#F59E0B15" }]}>
              <Feather name="message-square" size={18} color="#F59E0B" />
            </View>
            <ThemedText style={[styles.quickStatValue, { color: colors.text }]}>
              {mechanicProfile.reviewCount}
            </ThemedText>
            <ThemedText style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Reviews</ThemedText>
          </View>
          <View style={[styles.quickStatItem, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
            <View style={[styles.quickStatIcon, { backgroundColor: "#22C55E15" }]}>
              <Feather name="calendar" size={18} color="#22C55E" />
            </View>
            <ThemedText style={[styles.quickStatValue, { color: colors.text }]}>
              ${earningsData.thisMonth}
            </ThemedText>
            <ThemedText style={[styles.quickStatLabel, { color: colors.textSecondary }]}>This Month</ThemedText>
          </View>
          <View style={[styles.quickStatItem, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
            <View style={[styles.quickStatIcon, { backgroundColor: "#6366F115" }]}>
              <Feather name="clock" size={18} color="#6366F1" />
            </View>
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
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  welcomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 2,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  alertIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  alertText: {
    flex: 1,
    fontSize: 14,
  },
  statsSection: {
    flexDirection: "row",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
    paddingHorizontal: Spacing.xl,
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
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: "600",
  },
  scheduleList: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  scheduleTime: {
    width: 75,
    marginRight: Spacing.md,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
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
  chevronContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  emptySchedule: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    borderRadius: BorderRadius.xl,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
  },
  quickStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  quickStatItem: {
    width: "47%",
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  quickStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 13,
  },
});
