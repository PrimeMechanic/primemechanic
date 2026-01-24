import React from "react";
import { StyleSheet, Pressable, View, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { Booking } from "@/types";

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const statusLabels: Record<string, string> = {
  upcoming: "Upcoming",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function BookingCard({ booking, onPress }: BookingCardProps) {
  const { colors } = useTheme();

  const statusColors: Record<string, { bg: string; text: string }> = {
    upcoming: { bg: "rgba(0, 212, 255, 0.1)", text: colors.accent },
    in_progress: { bg: "rgba(245, 158, 11, 0.1)", text: colors.warning },
    completed: { bg: "rgba(34, 197, 94, 0.1)", text: colors.success },
    cancelled: { bg: "rgba(239, 68, 68, 0.1)", text: colors.error },
  };
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const statusStyle = statusColors[booking.status];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }, animatedStyle]}
    >
      <View style={styles.header}>
        <View style={styles.serviceInfo}>
          <View style={styles.iconContainer}>
            <Feather
              name={booking.service.icon as any}
              size={20}
              color={colors.accent}
            />
          </View>
          <View>
            <ThemedText style={[styles.serviceName, { color: colors.text }]}>
              {booking.service.name}
            </ThemedText>
            <ThemedText style={[styles.vehicleText, { color: colors.textSecondary }]}>
              {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
            </ThemedText>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <ThemedText style={[styles.statusText, { color: statusStyle.text }]}>
            {statusLabels[booking.status]}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.details}>
        <View style={styles.mechanicRow}>
          <Image source={booking.mechanic.avatar} style={styles.mechanicAvatar} />
          <ThemedText style={[styles.mechanicName, { color: colors.text }]}>
            {booking.mechanic.name}
          </ThemedText>
        </View>
        <View style={styles.dateTimeRow}>
          <View style={styles.detailItem}>
            <Feather name="calendar" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
              {formatDate(booking.date)}
            </ThemedText>
          </View>
          <View style={styles.detailItem}>
            <Feather name="clock" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>{booking.time}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={14} color={colors.textSecondary} />
          <ThemedText style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
            {booking.location}
          </ThemedText>
        </View>
        <ThemedText style={[styles.priceText, { color: colors.primary }]}>${booking.totalPrice}</ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  serviceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  serviceName: {
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
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  details: {
    gap: Spacing.sm,
  },
  mechanicRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mechanicAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: Spacing.sm,
  },
  mechanicName: {
    fontSize: 14,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: Spacing.md,
  },
  locationText: {
    fontSize: 13,
    flex: 1,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
  },
});
