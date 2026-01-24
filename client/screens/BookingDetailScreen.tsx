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
import { bookings } from "@/data/mockData";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type BookingDetailRouteProp = RouteProp<RootStackParamList, "BookingDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const statusColors: Record<string, { bg: string; text: string }> = {
  upcoming: { bg: "rgba(0, 212, 255, 0.15)", text: Colors.dark.primary },
  in_progress: { bg: "rgba(255, 214, 10, 0.15)", text: Colors.dark.warning },
  completed: { bg: "rgba(52, 199, 89, 0.15)", text: Colors.dark.success },
  cancelled: { bg: "rgba(255, 69, 58, 0.15)", text: Colors.dark.error },
};

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
          <View style={styles.iconContainer}>
            <Feather
              name={booking.service.icon as any}
              size={28}
              color={Colors.dark.primary}
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
            style={styles.mechanicCard}
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
                <Feather name="star" size={14} color={Colors.dark.warning} />
                <ThemedText style={styles.mechanicRating}>
                  {booking.mechanic.rating}
                </ThemedText>
                <ThemedText style={styles.mechanicReviews}>
                  ({booking.mechanic.reviewCount} reviews)
                </ThemedText>
              </View>
            </View>
            <Pressable style={styles.messageButton} onPress={handleMessage}>
              <Feather name="message-circle" size={20} color={Colors.dark.primary} />
            </Pressable>
          </Pressable>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Appointment Details</ThemedText>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Feather name="calendar" size={18} color={Colors.dark.primary} />
              </View>
              <View>
                <ThemedText style={styles.detailLabel}>Date</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {formatDate(booking.date)}
                </ThemedText>
              </View>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Feather name="clock" size={18} color={Colors.dark.primary} />
              </View>
              <View>
                <ThemedText style={styles.detailLabel}>Time</ThemedText>
                <ThemedText style={styles.detailValue}>{booking.time}</ThemedText>
              </View>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Feather name="map-pin" size={18} color={Colors.dark.primary} />
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
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleIconContainer}>
              <Feather name="truck" size={22} color={Colors.dark.primary} />
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
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>Service</ThemedText>
              <ThemedText style={styles.paymentValue}>
                ${booking.service.price}
              </ThemedText>
            </View>
            <View style={styles.paymentDivider} />
            <View style={styles.paymentRow}>
              <ThemedText style={styles.totalLabel}>Total</ThemedText>
              <ThemedText style={styles.totalValue}>${booking.totalPrice}</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {booking.status === "upcoming" ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
          <Button onPress={handleCancel} style={styles.cancelButton}>
            Cancel Booking
          </Button>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
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
    backgroundColor: "rgba(0, 212, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    color: Colors.dark.text,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  mechanicCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
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
    color: Colors.dark.text,
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
    color: Colors.dark.text,
  },
  mechanicReviews: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 212, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 212, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.dark.text,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: Spacing.md,
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 212, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.dark.text,
    marginBottom: 2,
  },
  vehiclePlate: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  paymentCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentLabel: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.dark.text,
  },
  paymentDivider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    color: Colors.dark.primary,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.dark.backgroundRoot,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  cancelButton: {
    backgroundColor: Colors.dark.error,
  },
});
