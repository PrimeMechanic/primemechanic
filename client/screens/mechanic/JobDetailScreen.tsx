import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { JobRequest } from "@/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "JobDetail">;

export default function JobDetailScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { job } = route.params;

  const [noteText, setNoteText] = useState("");
  const [uploading, setUploading] = useState(false);

  const bookingId = job.id;

  const { data: photos = [], refetch: refetchPhotos } = useQuery<any[]>({
    queryKey: ["/api/bookings", bookingId, "photos"],
    queryFn: async () => {
      const res = await fetch(
        new URL(`/api/bookings/${bookingId}/photos`, getApiUrl()).href,
        { credentials: "include" }
      );
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: notes = [], refetch: refetchNotes } = useQuery<any[]>({
    queryKey: ["/api/bookings", bookingId, "notes"],
    queryFn: async () => {
      const res = await fetch(
        new URL(`/api/bookings/${bookingId}/notes`, getApiUrl()).href,
        { credentials: "include" }
      );
      if (!res.ok) return [];
      return res.json();
    },
  });

  const beforePhotos = photos.filter((p: any) => p.photoType === "before");
  const afterPhotos = photos.filter((p: any) => p.photoType === "after");

  const [jobStatus, setJobStatus] = useState(job.status);

  const canStartJob = beforePhotos.length > 0 && (jobStatus === "accepted" || jobStatus === "pending");
  const canCompleteJob = jobStatus === "in_progress";
  const canAddAfterPhotos = jobStatus === "in_progress" || jobStatus === "completed";

  const { data: mechanicProfile } = useQuery<any>({
    queryKey: ["/api/users", user?.id, "mechanic-profile"],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await fetch(
        new URL(`/api/users/${user.id}/mechanic-profile`, getApiUrl()).href,
        { credentials: "include" }
      );
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user?.id,
  });

  const mechanicId = mechanicProfile?.id || job.mechanicId;

  const uploadPhoto = useCallback(
    async (photoType: "before" | "after") => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.8,
        });

        if (result.canceled) return;

        setUploading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const baseUrl = getApiUrl();
        const uploadRes = await fetch(new URL("/api/objects/upload", baseUrl).toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: `job-${bookingId}-${photoType}-${Date.now()}.jpg`,
            contentType: "image/jpeg",
            directory: ".private",
          }),
        });
        const uploadData = await uploadRes.json();

        if (uploadData.uploadUrl) {
          const imageUri = result.assets[0].uri;
          const imageResponse = await fetch(imageUri);
          const blob = await imageResponse.blob();
          await fetch(uploadData.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": "image/jpeg" },
            body: blob,
          });
        }

        const photoUrl = uploadData.objectPath || result.assets[0].uri;

        await apiRequest("POST", `/api/bookings/${bookingId}/photos`, {
          mechanicId,
          photoUrl,
          photoType,
          caption: null,
        });

        await refetchPhotos();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Photo upload error:", error);
      } finally {
        setUploading(false);
      }
    },
    [bookingId, mechanicId, refetchPhotos]
  );

  const addNote = useCallback(async () => {
    if (!noteText.trim()) return;

    try {
      await apiRequest("POST", `/api/bookings/${bookingId}/notes`, {
        mechanicId,
        content: noteText.trim(),
      });

      setNoteText("");
      await refetchNotes();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Add note error:", error);
    }
  }, [bookingId, noteText, refetchNotes]);

  const updateJobStatus = useCallback(
    async (newStatus: string) => {
      try {
        await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, {
          status: newStatus,
        });
        setJobStatus(newStatus as any);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Status update error:", error);
      }
    },
    [bookingId]
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: `${colors.primary}15`, text: colors.primary },
    accepted: { bg: "rgba(34, 197, 94, 0.12)", text: colors.success },
    in_progress: { bg: "rgba(245, 158, 11, 0.12)", text: colors.warning },
    completed: { bg: "rgba(34, 197, 94, 0.12)", text: colors.success },
  };

  const statusStyle = statusColors[jobStatus] || statusColors.pending;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.md, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <View style={[styles.card, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
          <View style={[styles.jobHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.customerInfo}>
              <Image
                source={job.customer.avatar}
                style={[styles.customerAvatar, { borderColor: colors.primary }]}
              />
              <View>
                <ThemedText style={[styles.customerName, { color: colors.text }]}>
                  {job.customer.name}
                </ThemedText>
                <ThemedText style={[styles.vehicleText, { color: colors.textSecondary }]}>
                  {job.vehicle.year} {job.vehicle.make} {job.vehicle.model}
                </ThemedText>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <ThemedText style={[styles.statusText, { color: statusStyle.text }]}>
                {jobStatus.replace("_", " ").charAt(0).toUpperCase() +
                  jobStatus.replace("_", " ").slice(1)}
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
              <ThemedText style={[styles.serviceName, { color: colors.text }]}>
                {job.service.name}
              </ThemedText>
              <ThemedText style={[styles.servicePrice, { color: colors.primary }]}>
                ${job.totalPrice}
              </ThemedText>
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
                <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                  {job.location}
                </ThemedText>
              </View>
            </View>

            {job.notes ? (
              <View style={[styles.notesBox, { backgroundColor: `${colors.textSecondary}08` }]}>
                <ThemedText style={[styles.notesLabel, { color: colors.textSecondary }]}>
                  Customer Notes:
                </ThemedText>
                <ThemedText style={[styles.notesText, { color: colors.text }]}>
                  {job.notes}
                </ThemedText>
              </View>
            ) : null}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
          <View style={styles.sectionHeader}>
            <Feather name="camera" size={20} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Before Photos
            </ThemedText>
            <ThemedText style={[styles.photoCount, { color: colors.textSecondary }]}>
              {beforePhotos.length}
            </ThemedText>
          </View>

          <View style={styles.photoGrid}>
            {beforePhotos.map((photo: any) => (
              <View key={photo.id} style={styles.photoWrapper}>
                <Image
                  source={{ uri: new URL(photo.photoUrl, getApiUrl()).href }}
                  style={styles.photoImage}
                />
              </View>
            ))}
            {jobStatus !== "completed" ? (
              <Pressable
                testID="button-add-before-photo"
                onPress={() => uploadPhoto("before")}
                disabled={uploading}
                style={[styles.addPhotoButton, { borderColor: colors.border }]}
              >
                {uploading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <Feather name="plus" size={24} color={colors.primary} />
                    <ThemedText style={[styles.addPhotoText, { color: colors.primary }]}>
                      Add
                    </ThemedText>
                  </>
                )}
              </Pressable>
            ) : null}
          </View>

          {beforePhotos.length === 0 && jobStatus !== "completed" ? (
            <View style={[styles.requiredBanner, { backgroundColor: `${colors.warning}15` }]}>
              <Feather name="alert-circle" size={16} color={colors.warning} />
              <ThemedText style={[styles.requiredText, { color: colors.warning }]}>
                At least 1 before photo required to start job
              </ThemedText>
            </View>
          ) : null}
        </View>

        {canAddAfterPhotos || afterPhotos.length > 0 ? (
          <View style={[styles.card, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
            <View style={styles.sectionHeader}>
              <Feather name="camera" size={20} color={colors.success} />
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                After Photos
              </ThemedText>
              <ThemedText style={[styles.photoCount, { color: colors.textSecondary }]}>
                {afterPhotos.length}
              </ThemedText>
            </View>

            <View style={styles.photoGrid}>
              {afterPhotos.map((photo: any) => (
                <View key={photo.id} style={styles.photoWrapper}>
                  <Image
                    source={{ uri: new URL(photo.photoUrl, getApiUrl()).href }}
                    style={styles.photoImage}
                  />
                </View>
              ))}
              {jobStatus === "in_progress" ? (
                <Pressable
                  testID="button-add-after-photo"
                  onPress={() => uploadPhoto("after")}
                  disabled={uploading}
                  style={[styles.addPhotoButton, { borderColor: colors.border }]}
                >
                  {uploading ? (
                    <ActivityIndicator color={colors.success} />
                  ) : (
                    <>
                      <Feather name="plus" size={24} color={colors.success} />
                      <ThemedText style={[styles.addPhotoText, { color: colors.success }]}>
                        Add
                      </ThemedText>
                    </>
                  )}
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: colors.backgroundDefault }, Shadows.medium]}>
          <View style={styles.sectionHeader}>
            <Feather name="file-text" size={20} color={colors.primary} />
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Job Notes
            </ThemedText>
            <ThemedText style={[styles.photoCount, { color: colors.textSecondary }]}>
              {notes.length}
            </ThemedText>
          </View>

          {jobStatus !== "completed" ? (
            <View style={styles.noteInputRow}>
              <TextInput
                testID="input-job-note"
                style={[
                  styles.noteInput,
                  {
                    backgroundColor: `${colors.textSecondary}08`,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Add a note..."
                placeholderTextColor={colors.textSecondary}
                value={noteText}
                onChangeText={setNoteText}
                multiline
              />
              <Pressable
                testID="button-add-note"
                onPress={addNote}
                disabled={!noteText.trim()}
                style={[
                  styles.addNoteButton,
                  {
                    backgroundColor: noteText.trim() ? colors.primary : `${colors.textSecondary}20`,
                  },
                ]}
              >
                <Feather
                  name="send"
                  size={18}
                  color={noteText.trim() ? "#FFFFFF" : colors.textSecondary}
                />
              </Pressable>
            </View>
          ) : null}

          {notes.length > 0 ? (
            <View style={styles.notesList}>
              {notes.map((note: any) => (
                <View
                  key={note.id}
                  style={[styles.noteItem, { borderBottomColor: colors.border }]}
                >
                  <ThemedText style={[styles.noteContent, { color: colors.text }]}>
                    {note.content}
                  </ThemedText>
                  <ThemedText style={[styles.noteTimestamp, { color: colors.textSecondary }]}>
                    {formatTimestamp(note.createdAt)}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.actionButtons}>
          {canStartJob ? (
            <Button
              onPress={() => updateJobStatus("in_progress")}
              disabled={beforePhotos.length === 0}
            >
              Start Job
            </Button>
          ) : null}

          {canCompleteJob ? (
            <Button onPress={() => updateJobStatus("completed")}>
              Complete Job
            </Button>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  card: {
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
    flex: 1,
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
  notesBox: {
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Montserrat_600SemiBold",
    flex: 1,
  },
  photoCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  photoWrapper: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  addPhotoButton: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addPhotoText: {
    fontSize: 12,
    fontWeight: "600",
  },
  requiredBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  requiredText: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  noteInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  noteInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
  },
  addNoteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  notesList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  noteItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  noteTimestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  actionButtons: {
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
});
