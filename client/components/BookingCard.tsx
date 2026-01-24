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
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { Booking } from "@/types";

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const statusColors: Record<string, { bg: string; text: string }> = {
  upcoming: { bg: "rgba(0, 212, 255, 0.1)", text: Colors.dark.accent },
  in_progress: { bg: "rgba(245, 158, 11, 0.1)", text: Colors.dark.warning },
  completed: { bg: "rgba(34, 197, 94, 0.1)", text: Colors.dark.success },
  cancelled: { bg: "rgba(239, 68, 68, 0.1)", text: Colors.dark.error },
};

const statusLabels: Record<string, string> = {
  upcoming: "Upcoming",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function BookingCard({ booking, onPress }: BookingCardProps) {
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
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.header}>
        <View style={styles.serviceInfo}>
          <View style={styles.iconContainer}>
            <Feather
              name={booking.service.icon as any}
              size={20}
              color={Colors.dark.accent}
            />
          </View>
          <View>
            <ThemedText style={styles.serviceName}>
              {booking.service.name}
            </ThemedText>
            <ThemedText style={styles.vehicleText}>
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

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.mechanicRow}>
          <Image source={booking.mechanic.avatar} style={styles.mechanicAvatar} />
          <ThemedText style={styles.mechanicName}>
            {booking.mechanic.name}
          </ThemedText>
        </View>
        <View style={styles.dateTimeRow}>
          <View style={styles.detailItem}>
            <Feather name="calendar" size={14} color={Colors.dark.textSecondary} />
            <ThemedText style={styles.detailText}>
              {formatDate(booking.date)}
            </ThemedText>
          </View>
          <View style={styles.detailItem}>
            <Feather name="clock" size={14} color={Colors.dark.textSecondary} />
            <ThemedText style={styles.detailText}>{booking.time}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={14} color={Colors.dark.textSecondary} />
          <ThemedText style={styles.locationText} numberOfLines={1}>
            {booking.location}
          </ThemedText>
        </View>
        <ThemedText style={styles.priceText}>${booking.totalPrice}</ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.backgroundRoot,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
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
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
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
    color: Colors.dark.text,
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
    color: Colors.dark.textSecondary,
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
    color: Colors.dark.textSecondary,
    flex: 1,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    color: Colors.dark.primary,
  },
});
