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

import { ThemedText } from "@/components/ThemedText";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Button } from "@/components/Button";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { jobRequests, activeJobs, completedJobs } from "@/data/mechanicData";
import { JobRequest } from "@/types";

interface JobCardProps {
  job: JobRequest;
  showActions?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onPress?: () => void;
}

function JobCard({ job, showActions, onAccept, onDecline, onPress }: JobCardProps) {
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
    pending: { bg: "rgba(0, 212, 255, 0.1)", text: Colors.dark.accent },
    accepted: { bg: "rgba(34, 197, 94, 0.1)", text: Colors.dark.success },
    in_progress: { bg: "rgba(245, 158, 11, 0.1)", text: Colors.dark.warning },
    completed: { bg: "rgba(34, 197, 94, 0.1)", text: Colors.dark.success },
  };

  const statusStyle = statusColors[job.status] || statusColors.pending;

  return (
    <Pressable
      style={({ pressed }) => [styles.jobCard, pressed && styles.jobCardPressed]}
      onPress={onPress}
    >
      <View style={styles.jobHeader}>
        <View style={styles.customerInfo}>
          <Image source={job.customer.avatar} style={styles.customerAvatar} />
          <View>
            <ThemedText style={styles.customerName}>{job.customer.name}</ThemedText>
            <ThemedText style={styles.vehicleText}>
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
          <View style={styles.serviceIconContainer}>
            <Feather name={job.service.icon as any} size={18} color={Colors.dark.accent} />
          </View>
          <ThemedText style={styles.serviceName}>{job.service.name}</ThemedText>
          <ThemedText style={styles.servicePrice}>${job.totalPrice}</ThemedText>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Feather name="calendar" size={14} color={Colors.dark.textSecondary} />
            <ThemedText style={styles.detailText}>
              {formatDate(job.date)} at {job.time}
            </ThemedText>
          </View>
          <View style={styles.detailItem}>
            <Feather name="map-pin" size={14} color={Colors.dark.textSecondary} />
            <ThemedText style={styles.detailText} numberOfLines={1}>
              {job.location}
            </ThemedText>
          </View>
        </View>

        {job.notes ? (
          <View style={styles.notesContainer}>
            <ThemedText style={styles.notesLabel}>Notes:</ThemedText>
            <ThemedText style={styles.notesText}>{job.notes}</ThemedText>
          </View>
        ) : null}
      </View>

      {showActions ? (
        <View style={styles.actionsRow}>
          <Pressable style={styles.declineButton} onPress={onDecline}>
            <Feather name="x" size={18} color={Colors.dark.error} />
            <ThemedText style={styles.declineText}>Decline</ThemedText>
          </Pressable>
          <Pressable style={styles.acceptButton} onPress={onAccept}>
            <Feather name="check" size={18} color={Colors.dark.buttonText} />
            <ThemedText style={styles.acceptText}>Accept</ThemedText>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function JobsScreen() {
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
      { title: "No Pending Requests", message: "New job requests will appear here." },
      { title: "No Active Jobs", message: "Jobs you've accepted will appear here." },
      { title: "No Past Jobs", message: "Completed jobs will appear here." },
    ];

    return (
      <View style={styles.emptyContainer}>
        <Feather name="briefcase" size={48} color={Colors.dark.textSecondary} />
        <ThemedText style={styles.emptyTitle}>{emptyMessages[selectedIndex].title}</ThemedText>
        <ThemedText style={styles.emptyMessage}>{emptyMessages[selectedIndex].message}</ThemedText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.md }]}>
        <SegmentedControl
          segments={["Requests", "Active", "History"]}
          selectedIndex={selectedIndex}
          onIndexChange={setSelectedIndex}
        />
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
    backgroundColor: Colors.dark.backgroundDefault,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  separator: {
    height: Spacing.md,
  },
  jobCard: {
    backgroundColor: Colors.dark.backgroundRoot,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: "hidden",
  },
  jobCardPressed: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: Spacing.md,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
    color: Colors.dark.text,
  },
  vehicleText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  serviceName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: Colors.dark.text,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    color: Colors.dark.primary,
  },
  detailsGrid: {
    gap: Spacing.sm,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    flex: 1,
  },
  notesContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.sm,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  declineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderRightWidth: 1,
    borderRightColor: Colors.dark.border,
  },
  declineText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark.error,
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.dark.success,
  },
  acceptText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark.buttonText,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
    color: Colors.dark.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
});
