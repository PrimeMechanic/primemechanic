import React, { useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  Image,
  Alert,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useTheme } from "@/context/ThemeContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { jobRequests, activeJobs, completedJobs } from "@/data/mechanicData";
import { JobRequest } from "@/types";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface JobCardProps {
  job: JobRequest;
  showActions?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onPress?: () => void;
}

function JobCard({ job, showActions, onAccept, onDecline, onPress }: JobCardProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: `${colors.primary}15`, text: colors.primary },
    accepted: { bg: "rgba(34, 197, 94, 0.12)", text: colors.success },
    in_progress: { bg: "rgba(245, 158, 11, 0.12)", text: colors.warning },
    completed: { bg: "rgba(34, 197, 94, 0.12)", text: colors.success },
  };

  const statusStyle = statusColors[job.status] || statusColors.pending;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 20, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 20, stiffness: 200 }); }}
      style={[styles.jobCard, { backgroundColor: colors.backgroundDefault }, Shadows.medium, animatedStyle]}
    >
      <View style={[styles.jobHeader, { borderBottomColor: colors.border }]}>
        <View style={styles.customerInfo}>
          <Image source={job.customer.avatar} style={[styles.customerAvatar, { borderColor: colors.primary }]} />
          <View>
            <ThemedText style={[styles.customerName, { color: colors.text }]}>{job.customer.name}</ThemedText>
            <ThemedText style={[styles.vehicleText, { color: colors.textSecondary }]}>
              {job.vehicle.year} {job.vehicle.make} {job.vehicle.model}
            </ThemedText>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <ThemedText style={[styles.statusText, { color: statusStyle.text }]}>
            {job.status.replace("_", " ").charAt(0).toUpperCase() + job.status.replace("_", " ").slice(1)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.jobDetails}>
        <View style={styles.serviceRow}>
          <LinearGradient
            colors={["#0FA958", "#0B8A47"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.serviceIconContainer}
          >
            <Feather name={job.service.icon as any} size={18} color="#FFFFFF" />
          </LinearGradient>
          <ThemedText style={[styles.serviceName, { color: colors.text }]}>{job.service.name}</ThemedText>
          <ThemedText style={[styles.servicePrice, { color: colors.primary }]}>${job.totalPrice}</ThemedText>
        </View>

        <View style={styles.detailsGrid}>
          <View style={[styles.detailItem, { backgroundColor: `${colors.textSecondary}08` }]}>
            <Feather name="calendar" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
              {formatDate(job.date)} at {job.time}
            </ThemedText>
          </View>
          <View style={[styles.detailItem, { backgroundColor: `${colors.textSecondary}08` }]}>
            <Feather name="map-pin" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
              {job.location}
            </ThemedText>
          </View>
        </View>

        {job.notes ? (
          <View style={[styles.notesContainer, { backgroundColor: `${colors.textSecondary}08` }]}>
            <ThemedText style={[styles.notesLabel, { color: colors.textSecondary }]}>Notes:</ThemedText>
            <ThemedText style={[styles.notesText, { color: colors.text }]}>{job.notes}</ThemedText>
          </View>
        ) : null}
      </View>

      {showActions ? (
        <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
          <Pressable 
            style={[styles.declineButton, { borderRightColor: colors.border }]} 
            onPress={onDecline}
          >
            <Feather name="x" size={18} color={colors.error} />
            <ThemedText style={[styles.declineText, { color: colors.error }]}>Decline</ThemedText>
          </Pressable>
          <Pressable onPress={onAccept}>
            <LinearGradient
              colors={["#0FA958", "#0B8A47"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.acceptButton}
            >
              <Feather name="check" size={18} color="#FFFFFF" />
              <ThemedText style={styles.acceptText}>Accept</ThemedText>
            </LinearGradient>
          </Pressable>
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

export default function JobsScreen() {
  const { colors } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const pendingJobs = jobRequests.filter((j) => j.status === "pending");
  const acceptedJobs = [...jobRequests.filter((j) => j.status === "accepted"), ...activeJobs];
  const pastJobs = completedJobs;

  const getDisplayedJobs = () => {
    switch (selectedIndex) {
      case 0:
        return pendingJobs;
      case 1:
        return acceptedJobs;
      case 2:
        return pastJobs;
      default:
        return pendingJobs;
    }
  };

  const handleAccept = (jobId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Job Accepted", "You have accepted this job request.");
  };

  const handleDecline = (jobId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Decline Job",
      "Are you sure you want to decline this job request?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Decline", style: "destructive" },
      ]
    );
  };

  const displayedJobs = getDisplayedJobs();

  const renderEmptyState = () => {
    const emptyMessages = [
      { title: "No Pending Requests", message: "New job requests will appear here.", icon: "inbox" },
      { title: "No Active Jobs", message: "Jobs you've accepted will appear here.", icon: "briefcase" },
      { title: "No Past Jobs", message: "Completed jobs will appear here.", icon: "check-circle" },
    ];

    const current = emptyMessages[selectedIndex];

    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconContainer, { backgroundColor: `${colors.textSecondary}10` }]}>
          <Feather name={current.icon as any} size={40} color={colors.textSecondary} />
        </View>
        <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>{current.title}</ThemedText>
        <ThemedText style={[styles.emptyMessage, { color: colors.textSecondary }]}>{current.message}</ThemedText>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.lg }]}>
        <View style={[styles.segmentContainer, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
          <SegmentedControl
            segments={["Requests", "Active", "History"]}
            selectedIndex={selectedIndex}
            onIndexChange={setSelectedIndex}
          />
        </View>
      </View>
      <FlatList
        data={displayedJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            showActions={selectedIndex === 0}
            onAccept={() => handleAccept(item.id)}
            onDecline={() => handleDecline(item.id)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
          displayedJobs.length === 0 && styles.emptyListContent,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  segmentContainer: {
    borderRadius: 14,
    padding: 4,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  separator: {
    height: Spacing.md,
  },
  jobCard: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    marginRight: Spacing.md,
    borderWidth: 2,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
  },
  vehicleText: {
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  jobDetails: {
    padding: Spacing.lg,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  serviceName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
  },
  detailsGrid: {
    gap: Spacing.sm,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  notesContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
  },
  declineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderRightWidth: 1,
  },
  declineText: {
    fontSize: 15,
    fontWeight: "600",
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing["3xl"],
    gap: Spacing.sm,
  },
  acceptText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: 15,
    textAlign: "center",
  },
});
