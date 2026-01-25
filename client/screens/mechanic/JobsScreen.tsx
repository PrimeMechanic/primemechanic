import React, { useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  Image,
  Alert,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Button } from "@/components/Button";
import { useTheme } from "@/context/ThemeContext";
import { Spacing, BorderRadius } from "@/constants/theme";
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
  const { colors } = useTheme();

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
    pending: { bg: `rgba(0, 212, 255, 0.1)`, text: colors.accent },
    accepted: { bg: `rgba(34, 197, 94, 0.1)`, text: colors.success },
    in_progress: { bg: `rgba(245, 158, 11, 0.1)`, text: colors.warning },
    completed: { bg: `rgba(34, 197, 94, 0.1)`, text: colors.success },
  };

  const statusStyle = statusColors[job.status] || statusColors.pending;

  const dynamicStyles = StyleSheet.create({
    jobCard: {
      backgroundColor: colors.backgroundDefault,
      borderColor: colors.border,
    },
    jobCardPressed: {
      backgroundColor: colors.backgroundTertiary,
    },
    jobHeader: {
      borderBottomColor: colors.border,
    },
    customerName: {
      color: colors.text,
    },
    vehicleText: {
      color: colors.textSecondary,
    },
    serviceRow: {
      color: colors.text,
    },
    serviceIconContainer: {
      backgroundColor: `rgba(15, 169, 88, 0.15)`,
    },
    serviceName: {
      color: colors.text,
    },
    servicePrice: {
      color: colors.primary,
    },
    detailItem: {
      color: colors.textSecondary,
    },
    detailText: {
      color: colors.textSecondary,
    },
    notesContainer: {
      backgroundColor: colors.backgroundTertiary,
    },
    notesLabel: {
      color: colors.textSecondary,
    },
    notesText: {
      color: colors.text,
    },
    actionsRow: {
      borderTopColor: colors.border,
    },
    declineButton: {
      borderRightColor: colors.border,
    },
    declineText: {
      color: colors.error,
    },
    acceptButton: {
      backgroundColor: colors.success,
    },
    acceptText: {
      color: colors.buttonText,
    },
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.jobCard, dynamicStyles.jobCard, pressed && [styles.jobCardPressed, dynamicStyles.jobCardPressed]]}
      onPress={onPress}
    >
      <View style={[styles.jobHeader, dynamicStyles.jobHeader]}>
        <View style={styles.customerInfo}>
          <Image source={job.customer.avatar} style={styles.customerAvatar} />
          <View>
            <ThemedText style={[styles.customerName, dynamicStyles.customerName]}>{job.customer.name}</ThemedText>
            <ThemedText style={[styles.vehicleText, dynamicStyles.vehicleText]}>
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
          <View style={[styles.serviceIconContainer, dynamicStyles.serviceIconContainer]}>
            <Feather name={job.service.icon as any} size={18} color={colors.accent} />
          </View>
          <ThemedText style={[styles.serviceName, dynamicStyles.serviceName]}>{job.service.name}</ThemedText>
          <ThemedText style={[styles.servicePrice, dynamicStyles.servicePrice]}>${job.totalPrice}</ThemedText>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Feather name="calendar" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.detailText, dynamicStyles.detailText]}>
              {formatDate(job.date)} at {job.time}
            </ThemedText>
          </View>
          <View style={styles.detailItem}>
            <Feather name="map-pin" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.detailText, dynamicStyles.detailText]} numberOfLines={1}>
              {job.location}
            </ThemedText>
          </View>
        </View>

        {job.notes ? (
          <View style={[styles.notesContainer, dynamicStyles.notesContainer]}>
            <ThemedText style={[styles.notesLabel, dynamicStyles.notesLabel]}>Notes:</ThemedText>
            <ThemedText style={[styles.notesText, dynamicStyles.notesText]}>{job.notes}</ThemedText>
          </View>
        ) : null}
      </View>

      {showActions ? (
        <View style={[styles.actionsRow, dynamicStyles.actionsRow]}>
          <Pressable style={[styles.declineButton, dynamicStyles.declineButton]} onPress={onDecline}>
            <Feather name="x" size={18} color={colors.error} />
            <ThemedText style={[styles.declineText, dynamicStyles.declineText]}>Decline</ThemedText>
          </Pressable>
          <Pressable style={[styles.acceptButton, dynamicStyles.acceptButton]} onPress={onAccept}>
            <Feather name="check" size={18} color={colors.buttonText} />
            <ThemedText style={[styles.acceptText, dynamicStyles.acceptText]}>Accept</ThemedText>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function JobsScreen() {
  const { colors } = useTheme();
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

  const dynamicScreenStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.backgroundDefault,
    },
    header: {
      backgroundColor: colors.backgroundRoot,
    },
    emptyTitle: {
      color: colors.text,
    },
    emptyMessage: {
      color: colors.textSecondary,
    },
  });

  const renderEmptyState = () => {
    const emptyMessages = [
      { title: "No Pending Requests", message: "New job requests will appear here." },
      { title: "No Active Jobs", message: "Jobs you've accepted will appear here." },
      { title: "No Past Jobs", message: "Completed jobs will appear here." },
    ];

    return (
      <View style={styles.emptyContainer}>
        <Feather name="briefcase" size={48} color={colors.textSecondary} />
        <ThemedText style={[styles.emptyTitle, dynamicScreenStyles.emptyTitle]}>{emptyMessages[selectedIndex].title}</ThemedText>
        <ThemedText style={[styles.emptyMessage, dynamicScreenStyles.emptyMessage]}>{emptyMessages[selectedIndex].message}</ThemedText>
      </View>
    );
  };

  return (
    <View style={[styles.container, dynamicScreenStyles.container]}>
      <View style={[styles.header, dynamicScreenStyles.header]}>
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
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
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
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  jobCardPressed: {
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
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: Spacing.md,
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
    fontSize: 18,
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
    gap: Spacing.sm,
  },
  acceptText: {
    fontSize: 15,
    fontWeight: "600",
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
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: 15,
    textAlign: "center",
  },
});
