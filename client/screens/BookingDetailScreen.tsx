import React from "react";
import { StyleSheet, View, Image, ScrollView, Pressable } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { bookings } from "@/data/mockData";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type BookingDetailRouteProp = RouteProp<RootStackParamList, "BookingDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const statusLabels: Record<string, string> = {
  upcoming: "Upcoming",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function BookingDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BookingDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { colors } = useTheme();
  const styles = createDynamicStyles(colors);

  const statusColors: Record<string, { bg: string; text: string }> = {
    upcoming: { bg: "rgba(0, 212, 255, 0.1)", text: colors.accent },
    in_progress: { bg: "rgba(245, 158, 11, 0.1)", text: colors.warning },
    completed: { bg: "rgba(34, 197, 94, 0.1)", text: colors.success },
    cancelled: { bg: "rgba(239, 68, 68, 0.1)", text: colors.error },
  };

  const booking = bookings.find((b) => b.id === route.params.bookingId) || bookings[0];
  const statusStyle = statusColors[booking.status];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleMessage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Chat", { conversationId: "1" });
  };

  const handleCancel = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: Spacing["4xl"] + (booking.status === "upcoming" ? 80 : 0),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <ThemedText style={[styles.statusText, { color: statusStyle.text }]}>
              {statusLabels[booking.status]}
            </ThemedText>
          </View>
        </View>

        <View style={styles.serviceCard}>
          <View style={[styles.iconContainer, { backgroundColor: `rgba(0, 212, 255, 0.1)` }]}>
            <Feather
              name={booking.service.icon as any}
              size={28}
              color={colors.accent}
            />
          </View>
          <ThemedText style={styles.serviceName}>{booking.service.name}</ThemedText>
          <ThemedText style={styles.serviceDescription}>
            {booking.service.description}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Mechanic</ThemedText>
          <Pressable
            style={[styles.mechanicCard, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}
            onPress={() =>
              navigation.navigate("MechanicProfile", { mechanicId: booking.mechanic.id })
            }
          >
            <Image source={booking.mechanic.avatar} style={styles.mechanicAvatar} />
            <View style={styles.mechanicInfo}>
              <ThemedText style={styles.mechanicName}>
                {booking.mechanic.name}
              </ThemedText>
              <View style={styles.mechanicStats}>
                <Feather name="star" size={14} color={colors.warning} />
                <ThemedText style={styles.mechanicRating}>
                  {booking.mechanic.rating}
                </ThemedText>
                <ThemedText style={styles.mechanicReviews}>
                  ({booking.mechanic.reviewCount} reviews)
                </ThemedText>
              </View>
            </View>
            <Pressable style={[styles.messageButton, { backgroundColor: `rgba(0, 212, 255, 0.1)` }]} onPress={handleMessage}>
              <Feather name="message-circle" size={20} color={colors.accent} />
            </Pressable>
          </Pressable>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Appointment Details</ThemedText>
          <View style={[styles.detailsCard, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
            <View style={styles.detailRow}>
              <View style={[styles.detailIconContainer, { backgroundColor: `rgba(0, 212, 255, 0.1)` }]}>
                <Feather name="calendar" size={18} color={colors.accent} />
              </View>
              <View>
                <ThemedText style={styles.detailLabel}>Date</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {formatDate(booking.date)}
                </ThemedText>
              </View>
            </View>
            <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
            <View style={styles.detailRow}>
              <View style={[styles.detailIconContainer, { backgroundColor: `rgba(0, 212, 255, 0.1)` }]}>
                <Feather name="clock" size={18} color={colors.accent} />
              </View>
              <View>
                <ThemedText style={styles.detailLabel}>Time</ThemedText>
                <ThemedText style={styles.detailValue}>{booking.time}</ThemedText>
              </View>
            </View>
            <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
            <View style={styles.detailRow}>
              <View style={[styles.detailIconContainer, { backgroundColor: `rgba(0, 212, 255, 0.1)` }]}>
                <Feather name="map-pin" size={18} color={colors.accent} />
              </View>
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>Location</ThemedText>
                <ThemedText style={styles.detailValue}>{booking.location}</ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Vehicle</ThemedText>
          <View style={[styles.vehicleCard, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
            <View style={[styles.vehicleIconContainer, { backgroundColor: `rgba(0, 212, 255, 0.1)` }]}>
              <Feather name="truck" size={22} color={colors.accent} />
            </View>
            <View>
              <ThemedText style={styles.vehicleName}>
                {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
              </ThemedText>
              <ThemedText style={styles.vehiclePlate}>
                {booking.vehicle.licensePlate}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Payment</ThemedText>
          <View style={[styles.paymentCard, { backgroundColor: colors.backgroundRoot, borderColor: colors.border }]}>
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>Service</ThemedText>
              <ThemedText style={styles.paymentValue}>
                ${booking.service.price}
              </ThemedText>
            </View>
            <View style={[styles.paymentDivider, { backgroundColor: colors.border }]} />
            <View style={styles.paymentRow}>
              <ThemedText style={styles.totalLabel}>Total</ThemedText>
              <ThemedText style={styles.totalValue}>${booking.totalPrice}</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {booking.status === "upcoming" ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md, backgroundColor: colors.backgroundRoot, borderTopColor: colors.border }]}>
          <Button onPress={handleCancel} style={[styles.cancelButton, { backgroundColor: colors.error }]}>
            Cancel Booking
          </Button>
        </View>
      ) : null}
    </View>
  );
}

const staticStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  serviceCard: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 15,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  mechanicCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  mechanicAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Spacing.md,
  },
  mechanicInfo: {
    flex: 1,
  },
  mechanicName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  mechanicStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mechanicRating: {
    fontSize: 14,
    fontWeight: "600",
  },
  mechanicReviews: {
    fontSize: 14,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  detailDivider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  vehiclePlate: {
    fontSize: 14,
  },
  paymentCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentLabel: {
    fontSize: 15,
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  paymentDivider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  cancelButton: {},
});

const createDynamicStyles = (colors: any) =>
  StyleSheet.create({
    ...staticStyles,
    container: {
      ...staticStyles.container,
      backgroundColor: colors.backgroundDefault,
    },
    serviceName: {
      ...staticStyles.serviceName,
      color: colors.text,
    },
    serviceDescription: {
      ...staticStyles.serviceDescription,
      color: colors.textSecondary,
    },
    sectionTitle: {
      ...staticStyles.sectionTitle,
      color: colors.textSecondary,
    },
    mechanicCard: {
      ...staticStyles.mechanicCard,
      backgroundColor: colors.backgroundRoot,
      borderColor: colors.border,
    },
    mechanicName: {
      ...staticStyles.mechanicName,
      color: colors.text,
    },
    mechanicRating: {
      ...staticStyles.mechanicRating,
      color: colors.text,
    },
    mechanicReviews: {
      ...staticStyles.mechanicReviews,
      color: colors.textSecondary,
    },
    detailsCard: {
      ...staticStyles.detailsCard,
      backgroundColor: colors.backgroundRoot,
      borderColor: colors.border,
    },
    detailLabel: {
      ...staticStyles.detailLabel,
      color: colors.textSecondary,
    },
    detailValue: {
      ...staticStyles.detailValue,
      color: colors.text,
    },
    detailDivider: {
      ...staticStyles.detailDivider,
      backgroundColor: colors.border,
    },
    vehicleCard: {
      ...staticStyles.vehicleCard,
      backgroundColor: colors.backgroundRoot,
      borderColor: colors.border,
    },
    vehicleName: {
      ...staticStyles.vehicleName,
      color: colors.text,
    },
    vehiclePlate: {
      ...staticStyles.vehiclePlate,
      color: colors.textSecondary,
    },
    paymentCard: {
      ...staticStyles.paymentCard,
      backgroundColor: colors.backgroundRoot,
      borderColor: colors.border,
    },
    paymentLabel: {
      ...staticStyles.paymentLabel,
      color: colors.textSecondary,
    },
    paymentValue: {
      ...staticStyles.paymentValue,
      color: colors.text,
    },
    paymentDivider: {
      ...staticStyles.paymentDivider,
      backgroundColor: colors.border,
    },
    totalLabel: {
      ...staticStyles.totalLabel,
      color: colors.text,
    },
    totalValue: {
      ...staticStyles.totalValue,
      color: colors.primary,
    },
    footer: {
      ...staticStyles.footer,
      backgroundColor: colors.backgroundRoot,
      borderTopColor: colors.border,
    },
  });
