import React, { useState } from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { SegmentedControl } from "@/components/SegmentedControl";
import { BookingCard } from "@/components/BookingCard";
import { EmptyState } from "@/components/EmptyState";
import { Spacing, Shadows } from "@/constants/theme";
import { bookings } from "@/data/mockData";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Booking } from "@/types";
import { useTheme } from "@/context/ThemeContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BookingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const tabBarHeight = useBottomTabBarHeight();
  const { colors } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const upcomingBookings = bookings.filter(
    (b) => b.status === "upcoming" || b.status === "in_progress"
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled"
  );

  const displayedBookings = selectedIndex === 0 ? upcomingBookings : pastBookings;

  const handleBookingPress = (booking: Booking) => {
    navigation.navigate("BookingDetail", { bookingId: booking.id });
  };

  const handleBookNow = () => {
    navigation.navigate("BookService", {});
  };

  const renderEmptyState = () => {
    if (selectedIndex === 0) {
      return (
        <EmptyState
          image={require("../../assets/images/empty-bookings.png")}
          title="No Upcoming Bookings"
          message="Book your first service and let a mechanic come to you."
          actionLabel="Book Now"
          onAction={handleBookNow}
        />
      );
    }
    return (
      <EmptyState
        image={require("../../assets/images/empty-bookings.png")}
        title="No Past Bookings"
        message="Your completed appointments will appear here."
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundRoot }]} edges={["top"]}>
      <View style={[styles.header, { paddingTop: Spacing.lg }]}>
        <ThemedText style={[styles.screenTitle, { color: colors.text }]}>My Bookings</ThemedText>
        <View style={[styles.segmentContainer, { backgroundColor: colors.backgroundDefault }, Shadows.small]}>
          <SegmentedControl
            segments={["Upcoming", "Past"]}
            selectedIndex={selectedIndex}
            onIndexChange={setSelectedIndex}
          />
        </View>
      </View>
      <FlatList
        data={displayedBookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookingCard booking={item} onPress={() => handleBookingPress(item)} />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
          displayedBookings.length === 0 && styles.emptyContainer,
        ]}
        scrollIndicatorInsets={{ bottom: 0 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
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
  screenTitle: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Montserrat_700Bold",
    marginBottom: Spacing.lg,
  },
  segmentContainer: {
    borderRadius: 14,
    padding: 4,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  separator: {
    height: Spacing.md,
  },
});
