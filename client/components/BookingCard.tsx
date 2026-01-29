import React from "react";
import { StyleSheet, Pressable, View, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
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

  const statusColors: Record<string, { bg: string; text: string; gradient?: string[] }> = {
    upcoming: { bg: `${colors.primary}15`, text: colors.primary },
    in_progress: { bg: "rgba(245, 158, 11, 0.12)", text: colors.warning },
    completed: { bg: "rgba(34, 197, 94, 0.12)", text: colors.success },
    cancelled: { bg: "rgba(239, 68, 68, 0.12)", text: colors.error },
  };
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 20, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 200 });
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
      style={[styles.container, { backgroundColor: colors.backgroundDefault }, Shadows.medium, animatedStyle]}
    >
      <View style={styles.header}>
        <View style={styles.serviceInfo}>
          <LinearGradient
            colors={["#0FA958", "#0B8A47"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Feather
              name={booking.service.icon as any}
              size={20}
              color="#FFFFFF"
            />
          </LinearGradient>
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
          <Image source={booking.mechanic.avatar} style={[styles.mechanicAvatar, { borderColor: colors.primary }]} />
          <ThemedText style={[styles.mechanicName, { color: colors.text }]}>
            {booking.mechanic.name}
          </ThemedText>
          <View style={styles.ratingBadge}>
            <Feather name="star" size={12} color={colors.warning} />
            <ThemedText style={[styles.ratingText, { color: colors.text }]}>4.9</ThemedText>
          </View>
        </View>
        <View style={styles.dateTimeRow}>
          <View style={[styles.detailItem, { backgroundColor: `${colors.textSecondary}08` }]}>
            <Feather name="calendar" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
              {formatDate(booking.date)}
            </ThemedText>
          </View>
          <View style={[styles.detailItem, { backgroundColor: `${colors.textSecondary}08` }]}>
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

      <View style={[styles.chevronContainer, { backgroundColor: `${colors.primary}10` }]}>
        <Feather name="chevron-right" size={18} color={colors.primary} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  serviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
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
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
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
    gap: Spacing.md,
  },
  mechanicRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mechanicAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: Spacing.sm,
    borderWidth: 1.5,
  },
  mechanicName: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 8,
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
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
  },
  chevronContainer: {
    position: "absolute",
    right: Spacing.lg,
    top: "50%",
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -16,
  },
});
